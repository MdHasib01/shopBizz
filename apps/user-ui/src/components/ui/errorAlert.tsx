import React from "react";
import { Alert } from "./alert";
import { CiCircleAlert } from "react-icons/ci";

const ErrorAlert = ({ message }: { message: string }) => {
  return (
    <Alert variant="destructive" className="mt-2 flex items-center">
      <CiCircleAlert />
      <p className="font-medium">{message}</p>
    </Alert>
  );
};

export default ErrorAlert;
