import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/auth/register-user.usecase";
import { UserRepository } from "../../infrastructure/database/repositories/user.repository";
import { LoginUserUseCase } from "../../application/auth/login-use.usecase";

export class AuthController{
    static async register (req: Request, res: Response) {
        const {email, password, role} = req.body;

        const userRepo = new UserRepository();
        const registerUser = new RegisterUserUseCase(userRepo);

        const result = await registerUser. execute({
            email,
            password,
            role
        });

        return res.status(201).json({
            message: 'User registered succesfully',
            user: result,
        })
    }
    
    static async login (req:Request, res: Response) {
        const {email, password} = req.body;

        const userRepo = new UserRepository();
        const loginUser  = new LoginUserUseCase(userRepo);

        const result = await loginUser. execute({email, password});

        return res.status(200).json({
            message:'Login successful',
            user: result.user,
            accessToken: result.accessToken,
        })

    }
}