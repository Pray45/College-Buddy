export const CreateError = (status: number, message: string, opration: string) => {

    const error = {
        statusCode: status? status : 400,
        messege: message? message : "Internal Server Error",
        opration: opration? opration : "not defined",
    }
    
    throw error;

}