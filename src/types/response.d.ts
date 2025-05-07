
type TSuccessResponse<ST> = {
    success: true;
    data: ST;
};

type TErrorResponse<ET> = {
    success: false;
    code: number;
    msg: ET;
};

type TResponse<ST, ET> = TSuccessResponse<ST> | TErrorResponse<ET>;