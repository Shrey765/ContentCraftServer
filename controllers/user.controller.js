const registerUser = async (req, res) => {
    try {
        const {username, email, password, name} = req.body;

        const missing = [username, email, password, name].some(
            (field) => !field || (typeof field === string && field.trim() === "")
        );

        if(missing){
            return res.status(400).json(
                {error: "All fields are required."}
            );
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {error: "Server error while registering the user"}
        );
    }
}

export {registerUser};