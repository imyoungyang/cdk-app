const { spawnSync } = require('child_process');
const { execSync } = require('child_process');
const { getSecrets } = require('./secrets-helper.js');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs-extra');

var default_region = "us-east-1",
  secretName = "trend/cicd/poc";

var secretStore = undefined;

async function deployCDK(secretStore) {

  // project config file
  const callerIdentity = await new aws.STS().getCallerIdentity().promise();
  const aid = callerIdentity.Account;

  var argv = `{
      "gitOwner": "beyoung-poc",
      "gitRepo": "demo",
      "env": {
          "region": "${default_region}",
          "account": ${aid}
      }
  }`;
  fs.outputFileSync(path.resolve('/tmp', 'argv.json'), argv);

  // 1. lambda execute path at /var/task but does not allow to create. Only /tmp can use.
  // 2. Without this config file, CDK will crash
  // https://github.com/awslabs/aws-cdk/blob/master/packages/aws-cdk/lib/api/util/sdk.ts#L245

  // setup aws config file.
  if (!fs.pathExistsSync(path.resolve('/tmp', '.aws', 'config'))) {
    var data = `
      [default]
      output = json
      region = ${default_region}
      `;
    fs.outputFileSync(path.resolve('/tmp', '.aws', 'config'), data);
  }

  // setup the credential file
  if (!fs.pathExistsSync(path.resolve('/tmp', 'credentials'))) {
    var data = `
      [default]
      aws_access_key_id=${aws.config.credentials.accessKeyId}
      aws_secret_access_key=${aws.config.credentials.secretAccessKey}
      `;
    fs.outputFileSync(path.resolve('/tmp', 'credentials'), data);
  }

  // 1. Overwrite the process.env.HOME Lambda default HOME is /home/usrXXX.
  // https://github.com/awslabs/aws-cdk/blob/master/packages/aws-cdk/lib/api/util/sdk.ts#L417
  // 2. Overwrite the default credetial file. Without that, CDK will try to mkdir in os.homedir().
  // https://github.com/awslabs/aws-cdk/blob/master/packages/aws-cdk/lib/api/util/sdk.ts#L297
  var cmd = `
  export AWS_SHARED_CREDENTIALS_FILE='/tmp/credentials'
  export HOME='/tmp'
  ./node_modules/aws-cdk/bin/cdk deploy -v
  `;
  var result = execSync(cmd).toString();
}

exports.handler = (event, context, callback) => {
  if (secretStore == undefined) {
    getSecrets(secretName, default_region, function(err, data) {
      if (err) throw err;
      if (data != '') {
        secretStore = JSON.parse(data);
        deployCDK(secretStore);
      }
    });
  }
  else {
    deployCDK(secretStore);
  }
};
