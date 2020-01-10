# Disposable-mail

A disposable and customizable email service on your own internet domain, using AWS building blocks. The service is totally serverless.
CloudFormation template and React/Material-UI client web app source code.

Read more on my [blog](https://www.vittorionardone.it/en/digital-transformation-blog/).

   - [First post - Overview and Amazon SES Configuration](https://www.vittorionardone.it/en/2020/01/10/your-disposable-emails-on-aws/) 

   - Second post - Backend details and installation (available soon)
   
   - Third post - Frontend details and installation (available soon)


![Architecture](aws/AWS_architecture.png?raw=true "Architecture")

# Requirements

   - an AWS account
   - an internet domain (a third level is better) on Route53 or anywhere it’s possible to configure the DNS zone
   - a pair of Google reCAPTCHA keys (site / private) valid for your domain ([reCAPTCHA console](https://www.google.com/recaptcha/admin))

# Installation (backend)

To build the entire backend infrastructure you can use the CloudFormation console or AWS CLI:

`aws cloudformation create-stack --stack-name <name> --template-url <url> --parameters <parameters> --capabilities CAPABILITY_IAM`

Description:

      <name>
            the stack name 
            
      <url> 
            template URL https://cfvn.s3-eu-west-1.amazonaws.com/disposable.yml
            
      <parameters>
            ParameterKey=DomainName,ParameterValue=<your_domain>  
            ParameterKey=ReCaptchaPrivateKey,ParameterValue=<your_private_captcha_key>

Once the stack is created, you need to know the newly created endpoint to be used in web application configuration. 
This is provided by CloudFormation as an output value. It is possible to get it in the CloudFormation console or directly from AWS CLI:

`aws cloudformation describe-stacks --stack-name <name> --query Stacks[0].Outputs[0].OutputValue`


# Installation (frontend)

To create the React web application, once the repository has been cloned, it is necessary to configure some parameters at the beginning of App.js file:

//  - your APIEndpoint

const APIEndpoint = <your_API_endpoint>; 

//  - your ReCaptcha Site Key

const ReCaptcha_SiteKey = <your_reCAPTCHA_site_key>;  
 
//  - your email domain 

const email_domain = <your_domain>;

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


