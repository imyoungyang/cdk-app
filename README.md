# CDK in AWS Lambda

In this example, it will use AWS CDK to deploy CloudFormation Stack. After cloudformation deployed, you will get a codebuild with github source.

## Install
1. checkout the code at cloud9
2. `npm install`
3. deploy the code to aws lambda

## Notes
1. `cdk.json`: cdk configuration. I add `"requireApproval": "never"` to autocomple without console interrupt.
2. `CodeBuild\create-codebuild.js` is CDK javascript
3. `CodeBuild/index.handler` is AWS Lambda handler
