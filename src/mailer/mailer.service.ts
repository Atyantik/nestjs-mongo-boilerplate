import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { ZerobounceValidator } from './validators/zerobounce.validator';

type TemplateOptions = {
  template: string;
  context?: { [key: string]: any };
};

type MailOptions = TemplateOptions & {
  to?: string;
  from?: string;
  bcc?: string;
  cc?: string;
  subject: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
  }[];
};

@Injectable()
export class MailerService {
  private templates: { [key: string]: any } = {};

  private transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(
    private readonly configService: ConfigService,
    private readonly zerobounceValidator: ZerobounceValidator,
  ) {
    // On initializing, it should precompile all the templates
    // console.log(this.configService);
    const pathToTemplates = path.join(__dirname, '..', '..', 'mail-templates');
    const pathExists = fs.existsSync(pathToTemplates);
    if (!pathExists) {
      throw new Error(
        'Cannot initialize Mailer Service. Cannot find mail-templates.',
      );
    }
    const partialsPath = path.resolve(pathToTemplates, 'partials');
    const pagesPath = path.resolve(pathToTemplates, 'pages');
    if (!fs.existsSync(partialsPath) || !fs.existsSync(pagesPath)) {
      throw new Error('Cannot resolve partials and pages.');
    }

    // Preload Partials
    const partials = (fs.readdirSync(partialsPath) ?? []).filter((f) =>
      f.endsWith('hbs'),
    );
    partials.forEach((partial) => {
      Handlebars.registerPartial(
        partial.replace('.hbs', ''),
        fs.readFileSync(path.join(partialsPath, partial)).toString(),
      );
    });

    const pages = (fs.readdirSync(pagesPath) ?? []).filter((f) =>
      f.endsWith('hbs'),
    );
    pages.forEach((page) => {
      this.templates[page.replace('.hbs', '')] = Handlebars.compile(
        fs.readFileSync(path.join(pagesPath, page)).toString(),
      );
    });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('app.mail.host'),
      port: this.configService.get('app.mail.port'),
      ignoreTLS: true,
      secure: false,
      auth: {
        user: this.configService.get('app.mail.username'),
        pass: this.configService.get('app.mail.password'),
      },
    });
  }

  getDefaultFrom() {
    return this.configService.get('app.mail.defaultFrom');
  }

  getDefaultCC() {
    return this.configService.get('app.mail.defaultCC') ?? '';
  }

  getDefaultBCC() {
    return this.configService.get('app.mail.defaultBCC');
  }

  getReportingTo() {
    return this.configService.get('app.mail.defaultReportingTo');
  }

  getContentHtml(options: TemplateOptions) {
    if (options.template && !this.templates[options.template]) {
      throw new Error(`Invalid template: ${options.template}`);
    }
    const context = {
      ...(options.context ?? {}),
      appUrl: this.configService.get('app.appUrl'),
    };
    return this.templates[options.template](context);
  }

  async sendMail(options: MailOptions) {
    const mailData = this.getContentHtml(options);
    const to = options.to ?? this.getReportingTo();
    const from = options.from ?? this.getDefaultFrom();
    const bcc = options.bcc ?? this.getDefaultBCC();
    const cc = options.cc ?? this.getDefaultCC();

    const message = {
      from,
      to,
      bcc,
      cc,
      subject: options.subject,
      html: mailData,
      attachments: options.attachments ?? [],
    };
    return this.transporter.sendMail(message);
  }

  async isValidEmail(email: string) {
    return this.zerobounceValidator.isValid(email);
  }
}
