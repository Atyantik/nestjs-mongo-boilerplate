# Local SSL
Our aim is to make sure we can run our local application with https and custom domains and not localhost

### Step 1 - Decide the domains
Lets assume we want to use a custom domain `customdomain.com`
We usually use subdomains for other services such as API, Auth, PWA etc.
So the domains and subdomains are 
 - api.local.customdomain.com
 - auth.local.customdomain.com
 - local.customdomain.com

The reason we like to keep local as sub-sub domain is usually when we launch a project, we keep production on api.customdomain.com we do not want it conflicting with out local setup.

### Step 2 - Update the v3.ext file
The above subdomains can be covered by following subdomains
 - *.local.customdomain.com
 - local.customdomain.com

Thus update the v3.ext file with values:
```
[alt_names]
DNS.1 = *.local.customdomain.com
DNS.2 = local.customdomain.com
```

### Step 3 - change the host file
We do not want our local browsers to go to internet to look for resolving the local.customdomain.com or *.local.customdomain.com.
** Google how to update host file for your operating system
So update the host file to point it out locally
```
127.0.0.1  api.local.customdomain.com auth.local.customdomain.com local.customdomain.com
```
Only add subdomains that really matter, if you do not have auth service, do not add it to host file.

### Step 4 - Create SSL with OpenSSL
#### Generate a Root SSL Certificate
Create an RSA-2048 key, and save it to the file rootCA.key.
```
openssl genrsa -des3 -out rootCA.key 2048
```
When you get “Enter passphrase for rootCA.key,” enter a passphrase and store it securely. As we are using it locally, I do not add a passphrase (just click enter)

#### Create a root certificate through the key generated.
```
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 3650 -out rootCA.pem
```
Change the validity days as needed. I keep it approx 10 years because we have project running from past 7 years and still ongoing. 

When you get “Enter passphrase for rootCA.key,” enter the passphrase used while generating the root key.

Enter the other optional information:
 - Country Name (2 letter code) [US]: US
 - State or Province Name (full name) [Some-State]: NY
 - Locality Name (e.g., city) []: New York
 - Organization Name (e.g., company) [ABC Pty Ltd]: Atyantik Technologies Private Limited
 - Organizational Unit Name (e.g., section) []: Development
 - Common Name (e.g., server FQDN or YOUR name) []: <Project> certificate 
 - Email Address []: contact@atyantik.com

#### Generate an SSL SAN Certificate With the Root Certificate
Let’s issue an SSL certificate to support our local domains `local.customdomain.com, api.local.customdomain.com, auth.local.customdomain.com` for testing.

Create a new OpenSSL configuration file server.csr.cnf so the configurations details can be used while generating the certificate.

```
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=US
ST=NY
L=New York
O=Atyantik Technologies Private Limited
OU=Development
emailAddress=contact@atyantik.com
CN = localhost
```

Create a private key and certificate-signing request (CSR) for the localhost certificate.

```
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config server.csr.cnf
```

This private key is stored on server.key

Let’s issue a certificate via the root SSL certificate and the CSR created earlier.

```
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
```

When it says “Enter passphrase for rootCA.key,” enter the passphrase used while generating the root key.

The output certificate is stored in a file called server.crt


#### Enable the SSL Certificate for the Local Server
I use caddy for simpliclity, you can use anything you like, google out how to setup SSL with your web server

`Caddyfile` Example:
```
api.local.customdomain.com {
	reverse_proxy 127.0.0.1:3000
	tls ./ssl/server.crt ./ssl/server.key
}

auth.local.customdomain.com {
	reverse_proxy 127.0.0.1:8080
	tls ./ssl/server.crt ./ssl/server.key
}

local.customdomain.com {
	reverse_proxy 127.0.0.1:3003
	tls ./ssl/server.crt ./ssl/server.key
}

```

### Trust the Root SSL Certificate
The final step. It varies based on operating system. our goal here is to make sure the operating system trusts the root certificate we created. i.e. `rootCA.pem`

For Mac refer to the following:
 - [https://support.apple.com/en-in/guide/keychain-access/kyca2431/mac](https://support.apple.com/en-in/guide/keychain-access/kyca2431/mac)
 - [https://www.bounca.org/tutorials/install_root_certificate.html](https://www.bounca.org/tutorials/install_root_certificate.html)

For Ubuntu:
It can be bit tricky but you can refer to good questions as below:
 - [https://superuser.com/questions/437330/how-do-you-add-a-certificate-authority-ca-to-ubuntu](https://superuser.com/questions/437330/how-do-you-add-a-certificate-authority-ca-to-ubuntu)
 - [https://askubuntu.com/questions/244582/add-certificate-authorities-system-wide-on-firefox/248326#248326](https://askubuntu.com/questions/244582/add-certificate-authorities-system-wide-on-firefox/248326#248326)

Hopefully the links are not dead!
