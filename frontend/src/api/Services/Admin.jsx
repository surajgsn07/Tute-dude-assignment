import axiosInstance from "../axiosInstance";
import { endpoints } from "../endpoints";

const adminSignup = (data)=>{
    console.log({data})
    return axiosInstance.post(endpoints.admin.register,data);
}

const adminLogin = (data)=>{
    return axiosInstance.post(endpoints.admin.login,data);
}

export {
    adminSignup,
    adminLogin
}