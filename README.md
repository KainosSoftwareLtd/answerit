# AnswerIt

Simple site/database to store common questions and their answers.  Specifically aimed at providing boiler-plate answers to common questions.

# Usage

## Configuration

To enable Azure AD sign-in, set the following environment variables:

`AZURE_IDENTITY_METADATA=https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx/.well-known/openid-configuration`

`AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx`

`AZURE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx=`

## Running the server application

`node server.js | bunyan`

If you want to know more about the above values, click [here](https://azure.microsoft.com/en-us/documentation/articles/active-directory-b2c-reference-oidc/#get-a-token).
More optional Azure AD settings can be found in [config.js](utils/config.js)

# Tech used
 
 * Nodejs
 * PostgreSQL
 * Handlebars (server-side)
 * Foundation (front-end styling)
