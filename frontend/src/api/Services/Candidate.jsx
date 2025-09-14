import axiosInstance from "../axiosInstance";
import { endpoints } from "../endpoints";

const createCandidate = async (candidate) => {
    return  axiosInstance.post(endpoints.candidate.create, candidate);
};

const getUploadSignature = async()=>{
    return axiosInstance.get(endpoints.candidate.uploadSignature);
}

const uploadVideo = async (formData) => {
    return axiosInstance.post(endpoints.candidate.uploadVideo, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

const getCompletedInterviews = async()=>{
    return axiosInstance.get(endpoints.candidate.completed);
}

const getOngoingInterviews = async()=>{
    return axiosInstance.get(endpoints.candidate.ongoing);
}

export {
    createCandidate,
    getUploadSignature,
    uploadVideo,
    getCompletedInterviews,
    getOngoingInterviews,
}