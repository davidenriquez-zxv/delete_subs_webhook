import axios from "axios";
import { sleep, buildResponse } from '../utils/webhook.utils.js'

const getCognitoToken = async () => {
    const data = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.CLIENT_ID,
        AuthParameters:
            {
                USERNAME: process.env.USER_EMAIL,
                PASSWORD: process.env.USER_PWD
            },
        ClientMetadata: {}
    };
    
    const config = {
      method: 'post',
      url: process.env.COGNITO_URL,
      headers: { 
        'Content-Type': 'application/x-amz-json-1.1', 
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth', 
        'X-Amz-User-Agent': 'aws-amplify/5.0.4 js'
      },
      data : data
    };
    
    let res = await axios(config);    
    return buildResponse(200, res, ['AuthenticationResult'])
}

const getSubscriptions = async (token) => {
    const data = JSON.stringify({
    query: `query {
                me {
                    subscriptions {
                        id   
                        status      
                    }
                }
            }`,
    variables: {}
    });

    const config = {
    method: 'post',
    url: process.env.BH_ENDPOINT,
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
    },
    data : data
    };

    let res = await axios(config);
    return buildResponse(200, res, ['data', 'me', 'subscriptions']);
}

const deleteSubscription = async (serverToken, subId) => {
    const data = JSON.stringify({
    query: `mutation ($input: ActivateSubscriptionInput!){
        deleteSubscription(input: $input) {
            success
            message
        }
    }`,
    variables: {
        input: { id: subId}}
    });

    const config = {
    method: 'post',
    url: process.env.BH_ENDPOINT,
    headers: { 
        'Authorization': `Bearer ${serverToken}`, 
        'Content-Type': 'application/json'
    },
    data : data
    };

    let res = await axios(config);

    return buildResponse(200, res, ['data', 'deleteSubscription']);
}

const activateSubscription = async (token, subId) => {
    const data = JSON.stringify({
    query: `mutation ($input: ActivateSubscriptionInput!){
            activateSubscription(input: $input) {
                success
                message
            }
        }`,
    variables: {
        input: { id: subId }
    }
    });

    const config = {
        method: 'post',
        url: process.env.BH_ENDPOINT,
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        },
        data: data
    };

    const res = await axios(config);

    return buildResponse(200, res, ['data', 'success']);
}

const validateSubsStatus = async (token, subs) => {
    let response = false;
    let validatedSubs = [];
    subs.forEach(async (i) => {
        if (i.status === 'ACTIVE') {
            validatedSubs.push(i.id)
        }
        if (i.status === 'PAUSED') {
            response = await activateSubscription(token, i.id);
            if (response) {
                validatedSubs.push(i.id)
            }
        }
        else if (i.status === 'CANCELED') {
            console.error("Can not activate a CANCELED sub");
        }
    });
    return validatedSubs;
}

const deleteSubscriptions = async () => {
    await sleep(1000);
    let userTokenResponse = await getCognitoToken();
    if (userTokenResponse.success === true) {
        let subsResponse = await getSubscriptions(userTokenResponse.data.IdToken);
        if (subsResponse.success === true) {
            let subsIds = await validateSubsStatus(userTokenResponse.data.IdToken, subsResponse.data);
            subsIds.forEach(async (subId) => {
                let deleteResponse = await deleteSubscription(process.env.SERVER_TOKEN, subId);
                console.log(deleteResponse);
            });
        }
    }
    else {
        console.log(userTokenResponse.data);
    }
}

export default deleteSubscriptions;