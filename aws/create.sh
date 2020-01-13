#!/bin/bash

zip CreateEmailFunction.zip CreateEmailFunction.py
zip GetEmailsListFunction.zip GetEmailsListFunction.py
zip GetEmailFileFunction.zip GetEmailFileFunction.py
zip IncomingMailCheckFunction.zip IncomingMailCheckFunction.py
zip StoreEmailFunction.zip StoreEmailFunction.py
zip CleanUpFunction.zip CleanUpFunction.py

aws s3 cp disposable.yml s3://cfvn
aws s3 cp CreateEmailFunction.zip s3://cfvn/disposable/CreateEmailFunction.zip
aws s3 cp GetEmailsListFunction.zip s3://cfvn/disposable/GetEmailsListFunction.zip
aws s3 cp GetEmailFileFunction.zip s3://cfvn/disposable/GetEmailFileFunction.zip
aws s3 cp IncomingMailCheckFunction.zip s3://cfvn/disposable/IncomingMailCheckFunction.zip
aws s3 cp StoreEmailFunction.zip s3://cfvn/disposable/StoreEmailFunction.zip
aws s3 cp CleanUpFunction.zip s3://cfvn/disposable/CleanUpFunction.zip

aws cloudformation create-stack --stack-name DisposableStack --template-url https://s3-eu-west-1.amazonaws.com/cfvn/disposable.yml  --parameters ParameterKey=DomainName,ParameterValue=aws.gotocloud.it ParameterKey=ReCaptchaPrivateKey,ParameterValue=6Lfb-8sUAAAAAOWepgMepRe95dSrsDidBTcDeVGq --capabilities CAPABILITY_IAM

