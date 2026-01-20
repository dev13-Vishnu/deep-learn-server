import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";

const router = Router();
// router.post ('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/me', jwtAuthMiddleware,(req,res) => {
    const user = (req as any). user;

    return res.status(200).json({
        message: 'Authenticated',
        user,
    });
})
router.post("/request-otp", AuthController.requestOtp)
router.post("/signup", AuthController.signup);

export default router;