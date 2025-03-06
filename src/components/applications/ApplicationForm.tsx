// src/components/applications/ApplicationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import PaymentModal from '@/components/payment/PaymentModal';
import { Application } from '@/types/mongo';

interface FormData {
    personalInfo: {
        name: string;
        fatherName: string;
        motherName: string;
        guardianName: string;
        dateOfBirth: string;
        photo: string;
    };
    addressInfo: {
        place: string;
        mahallu: string;
        postOffice: string;
        pinCode: string;
        panchayath: string;
        constituency: string;
        district: string;
        state: string;
    };
    contactInfo: {
        mobileNumber: string;
        candidateMobile: string;
        whatsappNumber: string;
        email: string;
    };
    educationalInfo: {
        madrasa: string;
        school: string;
        regNo: string;
        medium: string;
        hifzCompleted: boolean;
    };
}

const initialFormData: FormData = {
    personalInfo: {
        name: '',
        fatherName: '',
        motherName: '',
        guardianName: '',
        dateOfBirth: '',
        photo: '',
    },
    addressInfo: {
        place: '',
        mahallu: '',
        postOffice: '',
        pinCode: '',
        panchayath: '',
        constituency: '',
        district: '',
        state: '',
    },
    contactInfo: {
        mobileNumber: '',
        candidateMobile: '',
        whatsappNumber: '',
        email: '',
    },
    educationalInfo: {
        madrasa: '',
        school: '',
        regNo: '',
        medium: '',
        hifzCompleted: false,
    },
};

const ApplicationForm: React.FC = () => {
    const { user, userData } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [applicationData, setApplicationData] = useState<Partial<Application> | null>(null);

    // Prefill user data if available
    useEffect(() => {
        if (userData) {
            setFormData((prev) => ({
                ...prev,
                contactInfo: {
                    ...prev.contactInfo,
                    mobileNumber: userData.phoneNumber || '',
                    candidateMobile: userData.phoneNumber || '',
                    whatsappNumber: userData.phoneNumber || '',
                    email: userData.email || '',
                },
            }));
        }
    }, [userData]);

    const handleInputChange = (
        section: keyof FormData,
        field: string,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));

        // Clear error when user types
        if (errors[`${section}.${field}`]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[`${section}.${field}`];
                return newErrors;
            });
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (limit to 500KB)
        if (file.size > 500 * 1024) {
            setErrors((prev) => ({
                ...prev,
                'personalInfo.photo': 'Photo size should be less than 500KB',
            }));
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setErrors((prev) => ({
                ...prev,
                'personalInfo.photo': 'Please upload an image file',
            }));
            return;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setPhotoPreview(dataUrl);
            handleInputChange('personalInfo', 'photo', dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            // Validate personal info
            if (!formData.personalInfo.name) {
                newErrors['personalInfo.name'] = 'Name is required';
            }
            if (!formData.personalInfo.fatherName) {
                newErrors['personalInfo.fatherName'] = 'Father\'s name is required';
            }
            if (!formData.personalInfo.motherName) {
                newErrors['personalInfo.motherName'] = 'Mother\'s name is required';
            }
            if (!formData.personalInfo.dateOfBirth) {
                newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
            }
            if (!formData.personalInfo.photo) {
                newErrors['personalInfo.photo'] = 'Photo is required';
            }
        } else if (step === 2) {
            // Validate address info
            if (!formData.addressInfo.place) {
                newErrors['addressInfo.place'] = 'Place is required';
            }
            if (!formData.addressInfo.postOffice) {
                newErrors['addressInfo.postOffice'] = 'Post office is required';
            }
            if (!formData.addressInfo.pinCode) {
                newErrors['addressInfo.pinCode'] = 'PIN code is required';
            }
            if (!formData.addressInfo.district) {
                newErrors['addressInfo.district'] = 'District is required';
            }
            if (!formData.addressInfo.state) {
                newErrors['addressInfo.state'] = 'State is required';
            }
        } else if (step === 3) {
            // Validate contact info
            if (!formData.contactInfo.mobileNumber) {
                newErrors['contactInfo.mobileNumber'] = 'Mobile number is required';
            } else if (!/^\d{10}$/.test(formData.contactInfo.mobileNumber)) {
                newErrors['contactInfo.mobileNumber'] = 'Enter a valid 10-digit mobile number';
            }

            if (!formData.contactInfo.candidateMobile) {
                newErrors['contactInfo.candidateMobile'] = 'Candidate mobile number is required';
            } else if (!/^\d{10}$/.test(formData.contactInfo.candidateMobile)) {
                newErrors['contactInfo.candidateMobile'] = 'Enter a valid 10-digit mobile number';
            }

            if (!formData.contactInfo.email) {
                newErrors['contactInfo.email'] = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
                newErrors['contactInfo.email'] = 'Enter a valid email address';
            }
        } else if (step === 4) {
            // Validate educational info
            if (!formData.educationalInfo.school) {
                newErrors['educationalInfo.school'] = 'School name is required';
            }
            if (!formData.educationalInfo.regNo) {
                newErrors['educationalInfo.regNo'] = 'Registration number is required';
            }
            if (!formData.educationalInfo.medium) {
                newErrors['educationalInfo.medium'] = 'Medium is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate current step
        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare application data without payment info yet
            const applicationData: Partial<Application> = {
                userId: user?.uid || '',
                personalInfo: formData.personalInfo,
                addressInfo: formData.addressInfo,
                contactInfo: formData.contactInfo,
                educationalInfo: formData.educationalInfo,
                status: {
                    isApproved: false,
                    isQualified: false,
                    appliedAt: Date.now(),
                    updatedAt: Date.now(),
                },
            };

            // Save application data for payment processing
            setApplicationData(applicationData);

            // Show payment modal
            setShowPaymentModal(true);
        } catch (error) {
            console.error('Error preparing application submission:', error);
            alert('An error occurred while submitting the application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = async (paymentInfo: {
        transactionId: string;
        amount: number;
        date: string;
        status: 'pending' | 'completed' | 'failed';
    }) => {
        setIsLoading(true);

        try {
            console.log("Payment successful, preparing application submission");

            // Add payment info to application data
            const finalApplicationData: Partial<Application> = {
                ...applicationData,
                paymentInfo,
            };

            console.log("Submitting application with payment info:", finalApplicationData);

            // Submit complete application to the server
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalApplicationData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit application');
            }

            const result = await response.json();
            console.log("Application submission successful:", result);

            // Redirect to success page
            if (result._id) {
                console.log("Redirecting to success page with ID:", result._id);
                router.push(`/applications/success?id=${result._id}`);
            } else {
                console.error("No _id returned from API");
                alert('Application submitted but could not redirect to success page.');
                router.push('/dashboard/user');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('An error occurred while submitting the application. Please try again.');
        } finally {
            setIsLoading(false);
            setShowPaymentModal(false);
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Personal Information</h2>

                        <Input
                            label="Name of the Candidate"
                            placeholder="Enter full name"
                            value={formData.personalInfo.name}
                            onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                            error={errors['personalInfo.name']}
                            required
                        />

                        <Input
                            label="Name of Father"
                            placeholder="Enter father's name"
                            value={formData.personalInfo.fatherName}
                            onChange={(e) => handleInputChange('personalInfo', 'fatherName', e.target.value)}
                            error={errors['personalInfo.fatherName']}
                            required
                        />

                        <Input
                            label="Name of Mother"
                            placeholder="Enter mother's name"
                            value={formData.personalInfo.motherName}
                            onChange={(e) => handleInputChange('personalInfo', 'motherName', e.target.value)}
                            error={errors['personalInfo.motherName']}
                            required
                        />

                        <Input
                            label="Name of Guardian (if different from parents)"
                            placeholder="Enter guardian's name"
                            value={formData.personalInfo.guardianName}
                            onChange={(e) => handleInputChange('personalInfo', 'guardianName', e.target.value)}
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                value={formData.personalInfo.dateOfBirth}
                                onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                                required
                            />
                            {errors['personalInfo.dateOfBirth'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['personalInfo.dateOfBirth']}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Photo <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-start space-x-4">
                                <div>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="photo-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                >
                                                    <span>Upload a photo</span>
                                                    <input
                                                        id="photo-upload"
                                                        name="photo"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 500KB</p>
                                        </div>
                                    </div>
                                    {errors['personalInfo.photo'] && (
                                        <p className="mt-1 text-sm text-red-600">{errors['personalInfo.photo']}</p>
                                    )}
                                </div>

                                {photoPreview && (
                                    <div className="mt-1">
                                        <div className="w-32 h-40 overflow-hidden border rounded-md">
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Address Information</h2>

                        <Input
                            label="Place"
                            placeholder="Enter place"
                            value={formData.addressInfo.place}
                            onChange={(e) => handleInputChange('addressInfo', 'place', e.target.value)}
                            error={errors['addressInfo.place']}
                            required
                        />

                        <Input
                            label="Mahallu"
                            placeholder="Enter mahallu"
                            value={formData.addressInfo.mahallu}
                            onChange={(e) => handleInputChange('addressInfo', 'mahallu', e.target.value)}
                            error={errors['addressInfo.mahallu']}
                        />

                        <Input
                            label="Post Office"
                            placeholder="Enter post office"
                            value={formData.addressInfo.postOffice}
                            onChange={(e) => handleInputChange('addressInfo', 'postOffice', e.target.value)}
                            error={errors['addressInfo.postOffice']}
                            required
                        />

                        <Input
                            label="PIN Code"
                            placeholder="Enter PIN code"
                            value={formData.addressInfo.pinCode}
                            onChange={(e) => handleInputChange('addressInfo', 'pinCode', e.target.value)}
                            error={errors['addressInfo.pinCode']}
                            required
                        />

                        <Input
                            label="Panchayath"
                            placeholder="Enter panchayath"
                            value={formData.addressInfo.panchayath}
                            onChange={(e) => handleInputChange('addressInfo', 'panchayath', e.target.value)}
                            error={errors['addressInfo.panchayath']}
                        />

                        <Input
                            label="Constituency"
                            placeholder="Enter constituency"
                            value={formData.addressInfo.constituency}
                            onChange={(e) => handleInputChange('addressInfo', 'constituency', e.target.value)}
                            error={errors['addressInfo.constituency']}
                        />

                        <Input
                            label="District"
                            placeholder="Enter district"
                            value={formData.addressInfo.district}
                            onChange={(e) => handleInputChange('addressInfo', 'district', e.target.value)}
                            error={errors['addressInfo.district']}
                            required
                        />

                        <Input
                            label="State"
                            placeholder="Enter state"
                            value={formData.addressInfo.state}
                            onChange={(e) => handleInputChange('addressInfo', 'state', e.target.value)}
                            error={errors['addressInfo.state']}
                            required
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Contact Details</h2>

                        <Input
                            label="Mobile Number"
                            placeholder="Enter mobile number"
                            value={formData.contactInfo.mobileNumber}
                            onChange={(e) => handleInputChange('contactInfo', 'mobileNumber', e.target.value)}
                            error={errors['contactInfo.mobileNumber']}
                            required
                        />

                        <Input
                            label="Mobile Number of Candidate"
                            placeholder="Enter candidate's mobile number"
                            value={formData.contactInfo.candidateMobile}
                            onChange={(e) => handleInputChange('contactInfo', 'candidateMobile', e.target.value)}
                            error={errors['contactInfo.candidateMobile']}
                            required
                        />

                        <Input
                            label="WhatsApp Number"
                            placeholder="Enter WhatsApp number"
                            value={formData.contactInfo.whatsappNumber}
                            onChange={(e) => handleInputChange('contactInfo', 'whatsappNumber', e.target.value)}
                            error={errors['contactInfo.whatsappNumber']}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter email address"
                            value={formData.contactInfo.email}
                            onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                            error={errors['contactInfo.email']}
                            required
                        />
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Educational Qualification</h2>

                        <Input
                            label="Madrasa"
                            placeholder="Enter madrasa name"
                            value={formData.educationalInfo.madrasa}
                            onChange={(e) => handleInputChange('educationalInfo', 'madrasa', e.target.value)}
                            error={errors['educationalInfo.madrasa']}
                        />

                        <Input
                            label="School"
                            placeholder="Enter school name"
                            value={formData.educationalInfo.school}
                            onChange={(e) => handleInputChange('educationalInfo', 'school', e.target.value)}
                            error={errors['educationalInfo.school']}
                            required
                        />

                        <Input
                            label="Registration No. of SSLC/Equivalent"
                            placeholder="Enter registration number"
                            value={formData.educationalInfo.regNo}
                            onChange={(e) => handleInputChange('educationalInfo', 'regNo', e.target.value)}
                            error={errors['educationalInfo.regNo']}
                            required
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Medium <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                value={formData.educationalInfo.medium}
                                onChange={(e) => handleInputChange('educationalInfo', 'medium', e.target.value)}
                                required
                            >
                                <option value="">Select medium</option>
                                <option value="English">English</option>
                                <option value="Malayalam">Malayalam</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Kannada">Kannada</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors['educationalInfo.medium'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['educationalInfo.medium']}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center">
                                <input
                                    id="hifz-completed"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    checked={formData.educationalInfo.hifzCompleted}
                                    onChange={(e) => handleInputChange('educationalInfo', 'hifzCompleted', e.target.checked)}
                                />
                                <label htmlFor="hifz-completed" className="ml-2 block text-sm text-gray-700">
                                    Hifz Completed
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Fee Payment</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Proceed to the next step to complete your payment of ₹500.00 for the application fee.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Application Form</h1>
                <p className="text-gray-600">
                    Entrance Examination 2025
                </p>
            </div>

            <div className="mb-8">
                <div className="flex items-center">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${step <= currentStep
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {step}
                            </div>
                            {step < 4 && (
                                <div
                                    className={`w-12 h-1 ${step < currentStep ? 'bg-primary' : 'bg-gray-200'
                                        }`}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    <div>Personal</div>
                    <div>Address</div>
                    <div>Contact</div>
                    <div>Education</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="mt-8 flex justify-between">
                    {currentStep > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            className='bg-black text-white'
                            onClick={handleBack}
                            disabled={isSubmitting}
                        >
                            Previous
                        </Button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < 4 ? (
                        <Button
                            type="button"
                            className='bg-black text-white'
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className='bg-black text-white'
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Proceed to Payment
                        </Button>
                    )}
                </div>
            </form>

            {showPaymentModal && (
                <PaymentModal
                    amount={500}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                />
            )}
        </div>
    );
};

export default ApplicationForm;