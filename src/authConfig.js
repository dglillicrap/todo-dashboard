const msalConfig = {
  auth: {
    clientId: '19f19e6c-8ddc-44c0-b1fd-7b0e8a549d7b',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

export default msalConfig;