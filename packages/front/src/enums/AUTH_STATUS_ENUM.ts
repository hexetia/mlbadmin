// no backend é possível saber claramente se o usuário esta autenticado, mas
// aqui nossa autenticação é full client-side, tem 3 possíveis estados dessa autenticação
//
// 1: desconhecido (não sabemos se esta logado ou não)
// 2: não logado
// 3: logado
//
// @see https://twitter.com/kentcdodds/status/1234843376257658882 ('Stop using isLoading booleans
// Why using a status enum (or even better: a state machine) will help your app stay bug free.')
export enum AUTH_STATUS_ENUM {
    UNKNOW = 'unknow_auth_status',
    DISCONNECTED = 'disconnected',
    LOGGED = 'logged',
}
