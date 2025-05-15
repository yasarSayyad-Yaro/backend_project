const asyncHandler=(requestfuncction)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestfuncction(req,res,next))
        .catch((err)=>next(err));
    };
};

export {asyncHandler}
