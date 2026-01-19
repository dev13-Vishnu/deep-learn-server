import { MongoUserRepository } from "../database/repositories/MongoUserRepository";
import { LoginUserUseCase } from "../../application/auth/login-user.usecase";
import { RegisterUserUseCase } from "../../application/auth/register-user.usecase";


const UserRepository = new MongoUserRepository();

export const loginUserUseCase = new LoginUserUseCase(UserRepository);
export const registerUserUseCase  = new RegisterUserUseCase(UserRepository);