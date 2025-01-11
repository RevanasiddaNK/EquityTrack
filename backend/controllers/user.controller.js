import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import getDataUri from "../utils/datauri.js";
// import cloudinary from "../utils/cloudinary.js";

export const register = async(req, res) => {
    try {
        const { fullname, email,password} = req.body;

        console.log(fullname, email,password);

        // Check if any required field is missing
        if (!fullname || !email) {
            return res.status(400).json({
                message: "Required All Fileds",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: {
                fullname: newUser.fullname,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            success: false,
            error: error.message,
            false: error
        });
    }
};

export const login = async(req, res) => {
    try {
        console.log("Request body received:", req.body);

        const { email, password} = req.body;

        if (!email || !password) {
            console.log("Validation failed: Missing fields");
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            });
        }

        console.log("Checking user existence");
        let user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        console.log("Comparing passwords");
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log("Password mismatch for email:", email);
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }       

        // console.log("Generating JWT");
        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // console.log("Returning success response");
        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'None', 
                secure: true,
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true,
            });
    } catch (error) {
        console.error("Error in login route:", {
            message: error.message,
            stack: error.stack,
        });

        // Send detailed error in response
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message, // Add error details here
            success: false,
        });
    }
};


export const logout = async(req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async(req, res) => {
    try {
        const { fullname, email} = req.body;

        const userId = req.id;
        let user = await User.findById(userId);
        // console.log(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

    // Check if user is authenticated
export const  authCheck = async (req, res) => {
        try {
            const authUserdata = await User.findById(req.id).select("-password");
            console.log(authUserdata);
            if (!authUserdata) {
                console.log("Inside authcheck")
                return res.status(400).json({
                    message: "User not found",
                    success: false,
                });
            }
            console.log(authUserdata)
            return res.status(200).json(authUserdata);
        } catch (error) {
            console.log(`Error in authCheck controller: ${error.message}`);
            return res.status(500).json({ error: "Internal server error" });
        }
}