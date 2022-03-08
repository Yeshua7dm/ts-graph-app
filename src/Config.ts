const config = {
    appId: '5a33477f-ecbb-49d6-9157-0931c5f2174c',
    redirectUri: 'https://ms-email-joshua.netlify.app',
    // redirectUri: 'http://localhost:3000',
    scopes: [
        'user.read',
        'mailboxsettings.read',
        'mail.read',
        'mail.readwrite', 
        'mail.readbasic',
        'calendars.readwrite'
    ]
};

export default config;