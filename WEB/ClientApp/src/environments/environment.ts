export const environment = {
    production: false,
    baseUrl: `${window.location.origin}/`,
    // matches with launchSettings.json (which configures on which port the development api runs)
    baseApiUrl: `https://localhost:44501/api/`,
    baseAuthUrl: `https://localhost:44501/`,
    siteName: 'MONIC',
    runSetupCheck: true,
    useSubmit: true,
    useVerify: true,
    useApprove: true,
    useReject: false,
    //simplePermissionsMode: false
};