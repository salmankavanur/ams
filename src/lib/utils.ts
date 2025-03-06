// Format phone number
export const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format with international code if not present
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if missing
    if (!phoneNumber.startsWith('+') && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  };
  
  // Parse OTP input
  export const parseOtpInput = (input: string): string => {
    return input.replace(/\D/g, '');
  };
  
  // Validate phone number
  export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    // Basic validation - adjust based on your requirements
    const pattern = /^\+?[1-9]\d{9,14}$/;
    return pattern.test(phoneNumber.replace(/\s/g, ''));
  };