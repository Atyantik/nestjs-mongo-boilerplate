import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shortId, slugify } from '@utils/string';
import { FilterQuery, Model, QueryOptions } from 'mongoose';

export abstract class MongoService<T, CreateDto, UpdateDto, PartialUpdateDto> {
  protected configService: ConfigService;
  protected abstract model: Model<
    T & {
      uniqueId?: string;
      deletedAt?: null | number;
      updatedAt?: number;
      createdAt?: number;
    }
  >;

  protected slugKey = 'name';

  private get hasDeleteAt() {
    return !!(this.model?.schema?.path?.('deletedAt') ?? false);
  }

  private get hasCreatedAt() {
    return !!(this.model?.schema?.path?.('createdAt') ?? false);
  }

  private get hasUpdatedAt() {
    return !!(this.model?.schema?.path?.('updatedAt') ?? false);
  }

  private get hasUniqueId() {
    return !!(this.model?.schema?.path?.('uniqueId') ?? false);
  }

  private get hasSlug() {
    return !!(this.model?.schema?.path?.('slug') ?? false);
  }

  private get modelName() {
    return this?.model?.modelName ?? 'Mongo Model';
  }

  private checkModel() {
    if (!this?.model.modelName) {
      throw new InternalServerErrorException('Invalid model for the class.');
    }
  }

  private checkUniqueIdSupport() {
    if (!this.hasUniqueId) {
      throw new InternalServerErrorException(
        'This service does not support any operations by uniqueId',
      );
    }
  }

  /**
   * Find all with FilterQuery and project
   * @param filterQuery FilterQuery<T & { deletedAt?: number | null }
   * @returns
   */
  async findAll(
    filterQuery: FilterQuery<T & { deletedAt?: number | null }> = {},
    projection?: any | null,
    queryOptions?: QueryOptions | null,
  ) {
    this.checkModel();
    const query: any = {
      ...filterQuery,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = query.deletedAt ?? null;
    } else if (query.deletedAt) {
      throw new InternalServerErrorException(
        `The entity ${this.model.modelName} does not support deletedAt`,
      );
    }
    const returnData = this.model.find(
      query,
      projection ?? null,
      queryOptions ?? null,
    );
    if (this.hasCreatedAt) {
      returnData.sort({ createdAt: -1 });
    }

    return returnData.exec();
  }

  /**
   * Find all with FilterQuery and project
   * @param filterQuery FilterQuery<T & { deletedAt?: number | null }
   * @returns
   */
  count(filterQuery: FilterQuery<T & { deletedAt?: number | null }> = {}) {
    this.checkModel();
    const query: any = {
      ...filterQuery,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = query.deletedAt ?? null;
    } else if (query.deletedAt) {
      throw new InternalServerErrorException(
        `The entity ${this.model.modelName} does not support deletedAt`,
      );
    }
    return this.model.count(query).exec();
  }

  /**
   * Find one by ID
   * @param id string
   * @returns Model<T>
   */
  async findOne(
    id: string,
    projection?: any | null,
    queryOptions?: QueryOptions | null,
  ) {
    this.checkModel();
    const query: any = {
      _id: id,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    try {
      const record = await this.model
        .findOne(query, projection ?? null, queryOptions ?? null)
        .exec();
      if (!record) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      return record;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }

  /**
   * Find one by unique ID
   * @param uniqueId string
   * @returns Model<T>
   */
  async findOneByUniqueId(
    uniqueId: string,
    projection?: any | null,
    queryOptions?: QueryOptions | null,
  ) {
    // Check if model exists and has valid path
    this.checkModel();
    // check if the model supports uniqueId
    this.checkUniqueIdSupport();

    const query: any = {
      uniqueId,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    try {
      const record = await this.model
        .findOne(query, projection ?? null, queryOptions ?? null)
        .exec();
      if (!record) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      return record;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }

  create(createDto: CreateDto) {
    // Check if model exists and has valid path
    this.checkModel();
    const data: any = {
      ...createDto,
    };
    if (this.hasSlug && createDto?.[this.slugKey]) {
      data.slug = slugify(createDto[this.slugKey]);
    }
    try {
      if (this.hasCreatedAt && !data.createdAt) {
        data.createdAt = new Date().getTime();
      }
      const record = new this.model(data);
      return record.save();
    } catch (ex) {
      throw new InternalServerErrorException(ex.message);
    }
  }

  async update(id: string, updateDto: UpdateDto) {
    // Check if model exists and has valid path
    this.checkModel();
    const projection: any = {};
    const query: any = {
      _id: id,
    };
    const data: any = {
      ...updateDto,
    };
    if (this.hasCreatedAt) {
      projection.createdAt = 1;
    }
    if (this.hasUniqueId) {
      projection.uniqueId = 1;
    }
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    if (this.hasUpdatedAt) {
      data.updatedAt = new Date().getTime();
    }
    if (this.hasSlug && updateDto?.[this.slugKey]) {
      data.slug = slugify(updateDto[this.slugKey]);
    }
    try {
      let existingRecord = await this.findOne(id, projection);
      if (this.hasUniqueId) {
        data.uniqueId = existingRecord?.uniqueId ?? shortId();
      }
      if (this.hasCreatedAt) {
        data.createdAt = existingRecord?.createdAt ?? new Date().getTime();
      }
      existingRecord = await this.model
        .findOneAndReplace(query, data, {
          strict: true,
          new: true,
        })
        .exec();
      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }
  async updateByUniqueId(uniqueId: string, updateDto: UpdateDto) {
    // Check if model exists and has valid path
    this.checkModel();
    // check if the model supports uniqueId
    this.checkUniqueIdSupport();

    const query: any = {
      uniqueId,
    };
    const projection: any = {
      uniqueId: 1,
    };
    const data: any = {
      ...updateDto,
    };
    if (this.hasCreatedAt) {
      projection.createdAt = 1;
    }
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    try {
      let existingRecord = await this.findOneByUniqueId(uniqueId, projection);
      data.uniqueId = existingRecord?.uniqueId ?? shortId();
      if (this.hasSlug && updateDto?.[this.slugKey]) {
        data.slug = slugify(updateDto[this.slugKey]);
      }
      if (this.hasCreatedAt && existingRecord?.createdAt) {
        data.createdAt = existingRecord.createdAt;
      }
      if (this.hasUpdatedAt) {
        data.updatedAt = new Date().getTime();
      }
      existingRecord = await this.model
        .findOneAndReplace(query, data, {
          strict: true,
          new: true,
        })
        .exec();
      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }
  async partialUpdate(id: string, updateDto: PartialUpdateDto) {
    // Check if model exists and has valid path
    this.checkModel();
    const query: any = {
      _id: id,
    };
    const data: any = {
      ...updateDto,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    if (this.hasSlug && updateDto?.[this.slugKey]) {
      data.slug = slugify(updateDto[this.slugKey]);
    }
    try {
      const existingRecord = await this.model
        .findOneAndUpdate(query, data, { new: true })
        .exec();
      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }

  async partialUpdateByUniqueId(
    uniqueId: string,
    partialUpdateDto: PartialUpdateDto,
  ) {
    this.checkModel();
    this.checkUniqueIdSupport();
    const query: any = {
      uniqueId,
    };
    const data: any = {
      ...partialUpdateDto,
    };
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    if (this.hasSlug && partialUpdateDto?.[this.slugKey]) {
      data.slug = slugify(partialUpdateDto[this.slugKey]);
    }
    try {
      const existingRecord = await this.model
        .findOneAndUpdate(query, data, { new: true })
        .exec();
      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }

  async remove(id: string) {
    this.checkModel();
    const query: any = {
      _id: id,
    };
    const data: any = {
      deletedAt: new Date().getTime(),
    };
    if (this.hasDeleteAt) {
      query.deletedAt = null;
    }
    try {
      let existingRecord;
      if (this.hasDeleteAt) {
        existingRecord = await this.model
          .findOneAndUpdate(query, data, { new: true })
          .exec();
      } else {
        existingRecord = await this.model.deleteOne(query).exec();
      }

      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with id: ${id} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }

  async removeByUniqueId(uniqueId: string) {
    this.checkModel();
    this.checkUniqueIdSupport();
    const query: any = {
      uniqueId,
    };
    const data: any = {};
    if (this.hasDeleteAt) {
      query.deletedAt = null;
      data.deletedAt = new Date().getTime();
    }
    try {
      let existingRecord;
      if (this.hasDeleteAt) {
        existingRecord = await this.model
          .findOneAndUpdate(query, data, { new: true })
          .exec();
      } else {
        existingRecord = await this.model.deleteOne(query).exec();
      }

      if (!existingRecord) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      return existingRecord;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(
          `${this.modelName} with uniqueId: ${uniqueId} does not exists`,
        );
      }
      throw new InternalServerErrorException(ex.message);
    }
  }
}
