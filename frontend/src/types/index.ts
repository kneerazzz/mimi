export interface HomePageParams {
    pageNum: number
}

export type memeId = string;


export type commentId = string;

export type templateId = string;

export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}