const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const lambda = new AWS.Lambda();
const FUNCTION_NAME = process.env.FUNCTION_B

exports.main = async (event, context) => {
  console.log(JSON.stringify(event))
  console.log(JSON.stringify(context))
  
  const segment = AWSXRay.getSegment()
  console.log(JSON.stringify(segment))
  
  try {
    var method = event.httpMethod;

    if (method === "GET") {
      if (event.path === "/") {
        let message = await invokeLambda(segment)
        
        const response = {
          statusCode: 200,
          headers: {},
          body: JSON.stringify({
            message: `function-b says ${message}`
          })
        };
        
        console.log(JSON.stringify(segment))
        
        return response
      }
    }

    // We only accept GET for now
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET /"
    };
  } catch(error) {
    var body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
        headers: {},
        body: JSON.stringify(body)
    }
  }
}

const invokeLambda = segment => {
  return new Promise((resolve, reject) => {
    console.log('invoking Lambda function')

    const f = async (subsegment) => {
      subsegment.addAnnotation('function', FUNCTION_NAME)

      const req = {
        FunctionName: FUNCTION_NAME,
        InvocationType: "RequestResponse",
        Payload: ""
      }

      const resp = await lambda.invoke(req).promise()

      const respBody = resp.Payload.toString('utf8')
      subsegment.addMetadata('responseBody', respBody)

      subsegment.close()
      resolve()
    }

    AWSXRay.captureAsyncFunc("## invoking function-b", f, segment)
  })
}