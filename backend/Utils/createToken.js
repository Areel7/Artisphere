import jwt from "jsonwebtoken";

const genrateToken = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        // Lax avoids dropped cookies on cross-origin dev (e.g. 127.0.0.1 UI → localhost API)
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export default genrateToken;