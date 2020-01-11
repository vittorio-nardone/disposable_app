#!/bin/bash

aws s3 rm s3://incoming.disposable.aws.gotocloud.it/ --recursive
aws cloudformation delete-stack --stack-name DisposableStack
