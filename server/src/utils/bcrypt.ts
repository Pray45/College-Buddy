import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/constants';
import { CreateError } from '../config/Error';

export const BcryptHash = async (password: string) => {
    if(!SALT_ROUNDS)
        CreateError(404,"Salt rounds not found", "Bcrypt Hash");
    try {
        const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
        return hashedPass;
    } catch (error) {
        console.log(error);
    }
}

export const BcryptCheck = async (password: string | undefined, hash: string) => {
    try {    
        const isCorrect = await bcrypt.compare(password, hash);
        return isCorrect;
    } catch (error) {
        console.log(error);
    }
}