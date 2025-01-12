import { ZodError, ZodIssue } from "zod";

interface ErrorDetail {
    field: string;
    message: string;
}

interface ErrorResponse {
    error: {
        message: string;
        details: ErrorDetail[];
    };
}

export const formatZodError = (error: ZodError): ErrorResponse => {
    const details = error.errors.map((err: ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
    }));

    return {
        error: {
            message: 'Validation failed',
            details
        }
    };
};
