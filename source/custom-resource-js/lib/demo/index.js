/**
 * @function Demo Console Deploy
 * @description S3 module to deploy/delete ademo console to S3
*/
const AWS = require('aws-sdk');


// FEATURE/P15424610:: Function updated to use Async
let S3Deploy = async (config) => {
  const s3 = new AWS.S3();
  try {
		// copy files from manifest to S3
		let manifest = require('./console-manifest.json');
		await Promise.all(manifest.map(async (file) => {
			let params = {
				Bucket: config.DemoBucket,
				CopySource: '/' + config.SrcBucket + '/' + config.SrcPath + '/' + file,
				Key: file
			};
			await s3.copyObject(params).promise();
			console.log('file copied to s3: ', params.Key);
		}));
		// Copy config file generated by CloudFormation to S3
		let params = {
			Body: config.Exports,
			Bucket: config.DemoBucket,
			Key: 'console/assets/js/exports.js',
		};
		await s3.putObject(params).promise();
  }
	catch (err) {
    throw err;
  }
  return 'success';
};


// FEATURE/P15424610:: Function updated to use Async
let S3Delete = async (config) => {
  const s3 = new AWS.S3();
  try {
		// Create a list of objects to delete
		let manifest = require('./console-manifest.json');
		let objects = [];
		for (let i = 0; i < manifest.length; i++) {
			objects.push({
				Key: manifest[i]
			});
		}
		objects.push({
			Key: 'console/assets/js/exports.js'
		});
		// Delete Objects
		let params = {
			Bucket: config.DemoBucket,
			Delete: {
				Objects: objects
			}
		};
		await s3.deleteObjects(params).promise();
		//Delete bucket
		params = {
			Bucket: config.DemoBucket
		};
		await s3.deleteBucket(params).promise();
  }
	catch (err) {
    throw err;
  }
  return 'success';
};


module.exports = {
	s3Deploy: S3Deploy,
	s3Delete: S3Delete
};
