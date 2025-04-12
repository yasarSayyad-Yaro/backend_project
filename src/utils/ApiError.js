class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went Wrong",
        errors=[],
        statck=""
        
    ){
        super(message)
        this.statusCode=statusCode
        this.errors=errors
        this.success=false;
        this.data=null


        if(statck){
            this.stack=statck
        }else{
            Error.captureStackTrace(this,this,constructor)
        }
    }
}

export {ApiError}