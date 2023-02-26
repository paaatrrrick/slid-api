export interface Summary {
    /**
     * The content to be summarized
     */
    title: string,

    /**
     * The summarized content
     */
    summaries: any[],

    /**
     * 
     */
    id: string
}

export interface User {
    /**
     * Username of the user
     * 
     * @type {string}
     * @memberof User
     */
    username: string,

    /**
     * Hashed password
     * 
     * @type {string}
     * @memberof User
     */
    _id: string,

    /**
     * Array of summarization id's
     * 
     * @type {string[]}
     * @memberof User
     */
    summaries: string[]
}