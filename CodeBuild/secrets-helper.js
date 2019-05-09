Object.defineProperty(exports, "__esModule", { value: true });

var AWS = require('aws-sdk'),
    client = undefined;

// We rethrow the exception by default.
var getSecretsValue = function (secretName, region, callback) {
    var self = this;
    var secret = '';
    if (self.client == undefined) {
        self.client = new AWS.SecretsManager({
            region: region
        });
    }
    
    self.client.getSecretValue({SecretId: secretName}, function(err, data) {
        if (err) {
            throw err;
        }
        else {
            if ('SecretString' in data) {
                secret = data.SecretString;
            }
        }
        callback(err, secret);
    });
}
exports.getSecrets = getSecretsValue;