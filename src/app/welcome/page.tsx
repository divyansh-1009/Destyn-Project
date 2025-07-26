"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const INTEREST_OPTIONS = [
	"Music", "Movies", "Sports", "Travel", "Reading", "Cooking", "Dancing", "Gaming", "Art", "Photography", "Fitness", "Yoga", "Meditation", "Technology", "Science", "Nature", "Animals", "Fashion", "Shopping", "Writing", "Blogging", "Volunteering", "Gardening", "Hiking", "Cycling", "Swimming", "Board Games", "Podcasts", "DIY", "Cars"
];

const QUESTIONS = [
	{
		id: "q0",
		question: "Let's start with a profile photo that shows who you are",
		isPhotoUpload: true,
	},
	{
		id: "q1",
		question: "Write a short bio about yourself",
		isBio: true,
	},
	{
		id: "q2",
		question: "What are your interests? (Select as many as you like)",
		isInterests: true,
		//options: INTEREST_OPTIONS,
	},
	{
		id: "q3",
		question: "Tell us about your gender, who you'd like to date, and your date of birth",
		isGenderPrefDob: true,
	},
	{
		id: "q4",
		question: "Which of these would you love doing with someone you vibe with?",
		options: [
			"Learning or working together",
			"Stargazing and deep convos",
			"Explore places and go on Trips",
			"Jamming",
		],
	},
	{
		id: "q5",
		question: "What's your go-to comfort activity?",
		options: [
			"Gaming",
			"Reading",
			"Listening to music",
			"Watching shows",
			"Sleeping or just lying down",
		],
	},
	{
		id: "q6",
		question: "Which kind of books or stories do you enjoy?",
		options: [
			"Self-improvement or psychology",
			"Mystery/thrillers",
			"Romance or slice-of-life",
			"I don't really read",
		],
	},
	{
		id: "q7",
		question: "How do you usually respond to compliments?",
		options: [
			"Blush and get awkward",
			"Say thanks and move on",
			"Deny it even if I liked it",
			"Joke it off",
		],
	},
	{
		id: "q8",
		question: "Which music vibe do you connect with most?",
		options: [
			"Rock / Metal – intense",
			"Lo-fi / Chill – relaxed, peaceful",
			"Pop / K-pop – upbeat",
			"Indie / Acoustic – emotional, thoughtful",
			"EDM / Dance – energy and movement",
		],
	},
	{
		id: "q9",
		question: "What's your current relationship experience?",
		options: [
			"I've been in a serious relationship before",
			"I've dated casually",
			"I've never really dated",
			"I've only liked people from afar",
		],
	},
	{
		id: "q10",
		question: "What kind of snacks do you usually reach for?",
		options: [
			"Sweet stuff",
			"Salty or spicy",
			"Healthy fruits",
			"I just need a drink (tea/coffee/energy drink)",
		],
	},
	{
		id: "q11",
		question: "Pick the food that best matches your vibe:",
		options: [
			"Pizza — chill, classic, always a good time",
			"Ramen — warm, deep, and a bit mysterious",
			"Burgers — fun, messy, and full of surprises",
			"Dessert — sweet, soft, and makes people smile",
			"Healthy Bowl — focused, balanced, thoughtful",
		],
	},
	{
		id: "q12",
		question: "Which sounds most like you?",
		options: [
			"Loyal and thoughtful",
			"Quiet and observant",
			"Funny",
			"Deep thinker with a big heart",
		],
	},
	{
		id: "q13",
		question: "What kind of person are you drawn to?",
		options: [
			"Kind and supportive",
			"Smart and curious",
			"Funny and chill",
			"Creative or artistic",
		],
	},
	{
		id: "q14",
		question: "When you like someone, how do you act?",
		options: [
			"I get nervous and quiet",
			"I try to help or support them",
			"I message them a lot",
			"I act normal and try not to show it",
		],
	},
	{
		id: "q15",
		question: "How do you feel about personal space in a relationship?",
		options: [
			"I need a good amount of alone time",
			"I like being together, but need breaks",
			"I'd love to be around them a lot",
			"Haven't figured it out yet",
		],
	},
	{
		id: "q16",
		question: "Which of these sounds like your vibe in a relationship?",
		options: [
			"A team that supports each other",
			"Two people growing together",
			"Just chill and fun with no drama",
			"Someone who respects my space and quiet",
		],
	},
	{
		id: "q17",
		question: "How do you usually show someone that you like them?",
		options: [
			"I joke around with them",
			"I help them with stuff",
			"I send them memes or messages",
			"I get nervous and say nothing",
		],
	},
];

export default function WelcomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [answers, setAnswers] = useState<{ [key: string]: any }>({});
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [gender, setGender] = useState("");
	const [preference, setPreference] = useState("");
	const [dob, setDob] = useState("");
	const [bio, setBio] = useState("");
	const [profileCompleted, setProfileCompleted] = useState(false); // New state to track completion
	const [isCheckingCompletion, setIsCheckingCompletion] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

	// Add effect to fetch the user's profile photo when the component mounts
	useEffect(() => {
		if (session?.user?.email) {
			fetchUserProfile();
		}
	}, [session?.user?.email]);

	// Function to fetch user profile including photo
	const fetchUserProfile = async () => {
		try {
			const response = await fetch("/api/get-user-profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: session?.user?.email }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.profilePhoto) {
					setProfilePhoto(data.profilePhoto);
					// Also update the answers state
					setAnswers((prev) => ({ ...prev, q0: data.profilePhoto }));
				}
				if (data.bio) setBio(data.bio);
				if (data.interests) setSelectedInterests(data.interests);
				if (data.gender) setGender(data.gender);
				if (data.preference) setPreference(data.preference);
				if (data.birthdate) setDob(data.birthdate);
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	// Check profile completion when component mounts
	useEffect(() => {
		if (session?.user?.email) {
			checkProfileCompletion();
		}
	}, [session?.user?.email]);

	// Function to check profile completion
	const checkProfileCompletion = async () => {
		if (!session?.user?.email) return;
		
		setIsCheckingCompletion(true);
		try {
			const response = await fetch("/api/check-profile-completion", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: session.user.email }),
			});

			const data = await response.json();

			if (response.ok && data.isComplete) {
				// If profile is complete, redirect to main page
				router.push("/mainpage");
			} else {
				// If profile is incomplete, allow access to welcome page
				setIsCheckingCompletion(false);
			}
		} catch (error) {
			console.error("Error checking profile completion:", error);
			setIsCheckingCompletion(false);
		}
	};

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [status, router]);

	// Add this in the head section of your component
	useEffect(() => {
		// Add viewport meta tag to ensure proper scaling on mobile devices
		const meta = document.createElement('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
		document.getElementsByTagName('head')[0].appendChild(meta);
		
		return () => {
			document.getElementsByTagName('head')[0].removeChild(meta);
		};
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};
		
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	}, []);

	if (status === "loading")
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					background: "#000",
					color: "#fff",
				}}
			>
				<p>Loading...</p>
			</div>
		);

	if (!session?.user) return null;

	const handleChange = (qid: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [qid]: value }));
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !session?.user?.email) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			alert("File size must be less than 10MB");
			return;
		}

		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("photo", file);
			formData.append("userEmail", session.user.email);

			const response = await fetch("/api/upload-photo", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();
				setProfilePhoto(data.photoUrl);
				// Mark this question as answered
				setAnswers((prev) => ({ ...prev, q0: data.photoUrl }));
			} else {
				const error = await response.json();
				alert(`Upload failed: ${error.error}`);
			}
		} catch (error) {
			console.error("Error uploading photo:", error);
			alert("Failed to upload photo. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const handleNext = () => {
		if (currentQuestion < QUESTIONS.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
		}
	};

	const handlePrev = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			// Store all data in the answers object
			const updatedAnswers = {
				...answers,
				// Make sure q0 has the profile photo
				q0: profilePhoto,
				// Make sure q1 has the bio
				q1: bio,
				// Make sure q2 has the interests
				q2: selectedInterests,
				// Make sure q3 has gender, preference, and birthdate
				q3: {
					gender,
					preference,
					dob
				}
			};

			await fetch("/api/update-profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: session.user.email,
					name: session.user.name, // The name will be cleaned in the API route
					answers: updatedAnswers,
				}),
			});
			
			setProfileCompleted(true);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			setIsSubmitting(false);
		}
	};

	const goToMainPage = () => {
		router.push("/mainpage");
	};

	const currentQ = QUESTIONS[currentQuestion];
	const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
	const isPhotoQuestion = currentQ.isPhotoUpload;
	const canProceed = isPhotoQuestion ? !!profilePhoto : answers[currentQ.id];

	// Return loading state while checking completion
	if (isCheckingCompletion) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					color: "#fff",
				}}
			>
				<div style={{ textAlign: "center" }}>
					<div
						style={{
							width: "60px",
							height: "60px",
							border: "4px solid rgba(255,255,255,0.3)",
							borderTop: "4px solid white",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
							margin: "0 auto 20px auto",
						}}
					></div>
					<p style={{ fontSize: "18px", fontWeight: "500" }}>Checking your profile...</p>
					<style jsx>{`
						@keyframes spin {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
					`}</style>
				</div>
			</div>
		);
	}

	// Render the congratulations screen if profile is completed
	if (profileCompleted) {
		return (
			<div
				style={{
					minHeight: "100vh",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "10px",
				}}
			>
				<div
					style={{
						background: "#111", // Changed from "#fff" to black
						borderRadius: "20px",
						padding: "40px 30px",
						maxWidth: "600px",
						width: "100%",
						boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
						margin: "20px 20px",
						textAlign: "center",
					}}
				>
					<div
						style={{
							fontSize: "64px",
							marginBottom: "20px",
						}}
					>
						🎉
					</div>
					<h1
						style={{
							fontSize: "28px",
							fontWeight: "700",
							color: "#fff", // Changed from "#333" to white
							marginBottom: "16px",
						}}
					>
						Congratulations!
					</h1>
					<p
						style={{
							fontSize: "16px",
							color: "#999", // Changed from "#666" to lighter grey
							lineHeight: "1.6",
							marginBottom: "30px",
						}}
					>
						Your profile has been successfully created. You're all set to connect with amazing people!
					</p>
					<button
						onClick={goToMainPage}
						style={{
							padding: "16px 40px",
							background: "#667eea", // Changed to solid color to match other buttons
							color: "#fff",
							border: "none",
							borderRadius: "10px",
							cursor: "pointer",
							fontSize: "18px",
							fontWeight: "600",
							boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
							transition: "transform 0.2s ease",
						}}
						onMouseEnter={(e) => {
							(e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							(e.target as HTMLButtonElement).style.transform = "translateY(0)";
						}}
					>
						Start Exploring Destyn
					</button>
				</div>
			</div>
		);
	}

	const isMobile = windowWidth < 768;

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "10px",
			}}
		>
			<div
				style={{
					background: "#111", // Changed from "#fff" to dark
					borderRadius: "20px",
					padding: "20px",
					maxWidth: "600px",
					width: "calc(100% - 20px)",
					boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
					margin: "20px auto",
					overflow: "hidden",
				}}
			>
				{/* Progress Bar */}
				<div
					style={{
						background: "#222", // Changed from "#f0f0f0" to darker
						height: "12px",
						borderRadius: "10px",
						marginTop: "5px",
						marginLeft: "5px",
						marginRight: "5px",
						marginBottom: "30px",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							background: "#667eea",
							height: "100%",
							width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
							transition: "width 0.3s ease",
						}}
					/>
				</div>

				{/* Question Counter */}
				<div
					style={{
						textAlign: "center",
						color: "#999", // Changed from "#666" to lighter
						fontSize: "12px",
						marginBottom: "20px",
					}}
				>
					Question {currentQuestion + 1} of {QUESTIONS.length}
				</div>

				{/* Question */}
				<h2
					style={{
						fontSize: isMobile ? "18px" : "20px",
						fontWeight: "600",
						color: "#fff", // Changed from "#333" to white
						marginBottom: "30px",
						textAlign: "center",
						lineHeight: "1.4",
						padding: "0 10px",
					}}
				>
					{currentQ.question}
				</h2>

				{/* Options or Photo Upload UI */}
				{isPhotoQuestion ? (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "20px",
							marginBottom: "40px",
						}}
					>
						{/* Photo Preview Area */}
						<div
							style={{
								width: "150px",
								height: "150px",
								borderRadius: "50%",
								background: "#f0f0f0",
								overflow: "hidden",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid #e0e0e0",
							}}
						>
							{uploading ? (
								<div>⏳</div>
							) : profilePhoto ? (
								<img
									src={profilePhoto}
									alt="Profile Preview"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
							) : (
								<div
									style={{
										fontSize: "48px",
										color: "#ccc",
									}}
								>
									👤
								</div>
							)}
						</div>

						{/* Upload Button */}
						<button
							onClick={triggerFileInput}
							disabled={uploading}
							style={{
								padding: "12px 24px",
								background: uploading ? "#e0e0e0" : "#667eea",
								color: uploading ? "#999" : "#fff",
								border: "none",
								borderRadius: "8px",
								cursor: uploading ? "not-allowed" : "pointer",
								fontSize: "14px",
								fontWeight: "600",
							}}
						>
							{uploading ? "Uploading..." : profilePhoto ? "Change Photo" : "Choose Photo"}
						</button>

						{/* Hidden File Input */}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handlePhotoUpload}
							style={{ display: "none" }}
						/>

						{/* Helper Text */}
						<p
							style={{
								fontSize: "12px",
								color: "#666",
								textAlign: "center",
							}}
						>
							Upload a clear photo of yourself. This will help others recognize you.
							<br />
							Supported formats: JPG, PNG (Max 10MB)
						</p>
					</div>
				) : (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "15px",
							marginBottom: "40px",
						}}
					>
						{currentQ.isBio && (
							<textarea
								value={bio}
								onChange={e => { setBio(e.target.value); setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value })); }}
								placeholder="Tell us about yourself..."
								style={{ 
									width: '100%', 
									minHeight: 80, 
									borderRadius: 8, 
									border: '1px solid #333', // Darker border
									padding: 10, 
									fontSize: 14, 
									color: '#fff', // White text
									background: '#1a1a1a', // Dark background
								}}
							/>
						)}
						{currentQ.isInterests && (
							<div style={{ 
								display: 'flex', 
								flexWrap: 'wrap', 
								gap: 8, 
								marginBottom: 16,
								justifyContent: 'center'
							}}>
								{INTEREST_OPTIONS.map(opt => (
									<button
										key={opt}
										type="button"
										onClick={() => {
											setSelectedInterests(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
											setAnswers(prev => ({ ...prev, [currentQ.id]: prev[currentQ.id]?.includes(opt) ? prev[currentQ.id].filter((i: string) => i !== opt) : [...(prev[currentQ.id] || []), opt] }));
										}}
										style={{
											background: selectedInterests.includes(opt) ? '#667eea' : '#f0f0f0',
											color: selectedInterests.includes(opt) ? '#fff' : '#333',
											border: 'none',
											borderRadius: '16px',
											padding: '8px 16px',
											cursor: 'pointer',
											fontWeight: 500,
											margin: '4px',
											fontSize: window.innerWidth < 768 ? '12px' : '14px',
										}}
									>
										{opt}
									</button>
								))}
							</div>
						)}
						{currentQ.isGenderPrefDob && (
							<div style={{ 
								display: 'flex', 
								flexDirection: 'column', 
								gap: window.innerWidth < 768 ? 16 : 24, 
								alignItems: 'center', 
								marginBottom: 32,
								width: '100%'
							}}>
								<div style={{ width: '100%', maxWidth: 340 }}>
									<label style={{ 
										fontWeight: 600, 
										display: 'block', 
										marginBottom: 6, 
										color: '#fff'  // Changed from '#222' to white
									}}>
										Gender
									</label>
									<select 
										value={gender} 
										onChange={e => { setGender(e.target.value); setAnswers(prev => ({ ...prev, [currentQ.id]: { ...prev[currentQ.id], gender: e.target.value } })); }} 
										style={{ 
											width: '100%', 
											padding: '10px', 
											borderRadius: '8px', 
											border: '1px solid #333', // Darker border
											fontSize: window.innerWidth < 768 ? '14px' : '15px', 
											color: '#fff', // White text
											background: '#1a1a1a', // Dark background
											appearance: 'auto' // Ensures proper display on mobile
										}}
									>
										<option value="">Select your gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
								</div>
								<div style={{ width: '100%', maxWidth: 340 }}>
									<label style={{ 
										fontWeight: 600, 
										display: 'block', 
										marginBottom: 6, 
										color: '#fff'  // Changed from '#222' to white
									}}>
										Interested in dating
									</label>
									<select 
										value={preference} 
										onChange={e => { setPreference(e.target.value); setAnswers(prev => ({ ...prev, [currentQ.id]: { ...prev[currentQ.id], preference: e.target.value } })); }} 
										style={{ 
											width: '100%', 
											padding: '10px', 
											borderRadius: '8px', 
											border: '1px solid #333', // Darker border
											fontSize: window.innerWidth < 768 ? '14px' : '15px', 
											color: '#fff', // White text
											background: '#1a1a1a', // Dark background
											appearance: 'auto' // Ensures proper display on mobile
										}}
									>
										<option value="">Select preference</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
								</div>
								<div style={{ width: '100%', maxWidth: 340 }}>
									<label style={{ 
										fontWeight: 600, 
										display: 'block', 
										marginBottom: 6, 
										color: '#fff'  // Changed from '#222' to white
									}}>
										Date of Birth
									</label>
									<input 
										type="date" 
										value={dob} 
										onChange={e => { 
											const inputDate = e.target.value;
                                            const selectedDate = new Date(inputDate);
                                            const today = new Date();
                                            
                                            // First validate that the date actually exists (handles cases like Feb 31)
                                            if (isNaN(selectedDate.getTime())) {
                                                // Invalid date format - don't update state
                                                setAnswers(prev => ({ 
                                                    ...prev, 
                                                    [currentQ.id]: { 
                                                        ...prev[currentQ.id], 
                                                        dob: inputDate,
                                                        isValidDob: false,
                                                        errorMessage: "Invalid date selected" 
                                                    } 
                                                }));
                                                setDob(inputDate);
                                                return;
                                            }
                                            
                                            // Calculate age
                                            let age = today.getFullYear() - selectedDate.getFullYear();
                                            const monthDiff = today.getMonth() - selectedDate.getMonth();
                                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                                                age--;
                                            }
                                            
                                            setDob(inputDate);
                                            
                                            // Validate age range
                                            if (age >= 18 && age <= 100) {
                                                setAnswers(prev => ({ 
                                                    ...prev, 
                                                    [currentQ.id]: { 
                                                        ...prev[currentQ.id], 
                                                        dob: inputDate,
                                                        isValidDob: true,
                                                        errorMessage: null
                                                    } 
                                                }));
                                            } else {
                                                setAnswers(prev => ({ 
                                                    ...prev, 
                                                    [currentQ.id]: { 
                                                        ...prev[currentQ.id], 
                                                        dob: inputDate,
                                                        isValidDob: false,
                                                        errorMessage: age < 18 ? "You must be at least 18 years old" : "Age cannot exceed 100 years" 
                                                    } 
                                                }));
                                            }
										}} 
										style={{ 
											width: '100%', 
											padding: 10, 
											borderRadius: 8, 
											border: `1px solid ${answers[currentQ.id]?.isValidDob === false ? '#ff4d4d' : '#333'}`, // Darker border with error color
											fontSize: 15, 
											color: '#fff', // White text
											background: '#1a1a1a' // Dark background
										}} 
										max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
										min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
									/>
									{answers[currentQ.id]?.isValidDob === false && (
										<p style={{ color: '#ff4d4d', fontSize: 12, marginTop: 4 }}>
											Incorrect Age
										</p>
									)}
								</div>
							</div>
						)}
						{currentQ.options?.map((opt) => (
							<label
								key={opt}
								style={{
									display: "flex",
									alignItems: "center",
									padding: "10px 15px",
									border: answers[currentQ.id] === opt
										? "2px solid #667eea"
										: "2px solid #333", // Changed from "#e0e0e0" to darker
									borderRadius: "10px",
									cursor: "pointer",
									transition: "all 0.2s ease",
									background: answers[currentQ.id] === opt 
										? "rgba(102, 126, 234, 0.2)" // Semi-transparent highlight
										: "#1a1a1a", // Dark background for options
								}}
							>
								<input
									type="radio"
									name={currentQ.id}
									value={opt}
									checked={answers[currentQ.id] === opt}
									onChange={() => handleChange(currentQ.id, opt)}
									style={{
										marginRight: "10px",
										transform: "scale(1.1)",
									}}
								/>
								<span
									style={{
										fontSize: "13px",
										color: "#fff", // Changed from "#333" to white
										lineHeight: "1.4",
									}}
								>
									{opt}
								</span>
							</label>
						))}
					</div>
				)}

				{/* Navigation Buttons */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<button
						onClick={handlePrev}
						disabled={currentQuestion === 0}
						style={{
							padding: "12px 24px",
							background: "#667eea", // Changed to match Choose Photo button
							color: "#fff",
							border: "none",
							borderRadius: "8px",
							cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
							fontSize: "14px",
							fontWeight: "500",
							opacity: currentQuestion === 0 ? "0.5" : "1", // Use opacity for disabled state
						}}
					>
						Previous
					</button>

					{isLastQuestion ? (
						<button
							onClick={handleSubmit}
							disabled={!canProceed || isSubmitting}
							style={{
								padding: "12px 32px",
								background: "#667eea", // Changed to match Choose Photo button
								color: "#fff",
								border: "none",
								borderRadius: "8px",
								cursor: canProceed && !isSubmitting ? "pointer" : "not-allowed",
								fontSize: "14px",
								fontWeight: "600",
								opacity: (!canProceed || isSubmitting) ? "0.5" : "1", // Use opacity for disabled state
							}}
						>
							{isSubmitting ? "Submitting..." : "Complete Profile"}
						</button>
					) : (
						<button
							onClick={handleNext}
							disabled={!canProceed}
							style={{
								padding: "12px 24px",
								background: "#667eea", // Changed to match Choose Photo button
								color: "#fff",
								border: "none",
								borderRadius: "8px",
								cursor: canProceed ? "pointer" : "not-allowed",
								fontSize: "14px", // Changed to match other buttons
								fontWeight: "500",
								opacity: !canProceed ? "0.5" : "1", // Use opacity for disabled state
							}}
						>
							Next
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
