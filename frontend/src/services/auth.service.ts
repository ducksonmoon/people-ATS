/**
 * Handle authentication errors with consistent patterns
 * @param error The caught error from API calls
 * @param navigate The navigate function from useNavigate hook
 * @returns A standardized error message
 */
export const handleAuthError = (error: any, navigate?: any) => {
  let errorMessage = "An unexpected error occurred";
  let errorCode = null;

  // Handle structured API errors
  if (error?.data?.message) {
    if (typeof error.data.message === "string") {
      errorMessage = error.data.message;
    } else if (Array.isArray(error.data.message)) {
      errorMessage = error.data.message.join(". ");
    }
    errorCode = error.data.errorCode;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // If we have a navigate function, redirect with error in URL
  if (navigate) {
    const params = new URLSearchParams();

    if (errorCode) {
      params.append("errorCode", errorCode);
    } else {
      params.append("error", encodeURIComponent(errorMessage));
    }

    navigate({
      search: params.toString(),
    });
  }

  return {
    message: errorMessage,
    code: errorCode,
  };
};
