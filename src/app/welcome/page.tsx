"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { useImageCompression } from "@/lib/useImageCompression";
import CompressionProgress from "@/components/CompressionProgress";

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
	const [photos, setPhotos] = useState<{ id: string, preview: string, fileOrUrl: File | string }[]>([]);
	const [uploading, setUploading] = useState(false);
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [gender, setGender] = useState("");
	const [preference, setPreference] = useState("");
	const [dob, setDob] = useState("");
	const [profileCompleted, setProfileCompleted] = useState(false);
	const [isCheckingCompletion, setIsCheckingCompletion] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const {
		compressMultipleImages,
		state: compressionState,
		compressionInfo,
	} = useImageCompression({
		compressionOptions: {
			maxWidth: 1000,
			maxHeight: 1000,
			quality: 0.8,
			format: 'jpeg'
		},
		onError: (error) => {
			console.error('Compression error:', error);
			alert('Failed to compress image. Please try again.');
		}
	});

	useEffect(() => {
		if (session?.user?.email) {
			fetchUserProfile();
		}
	}, [session?.user?.email]);

	const fetchUserProfile = async () => {
		try {
			const response = await fetch("/api/get-user-profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: session?.user?.email }),
			});

			if (response.ok) {
				const data = await response.json();
				const photoUrls = data.profilePhotos || (data.profilePhoto ? [data.profilePhoto] : []);
				const loadedPhotos = photoUrls.map((url: string) => ({ 
					id: uuidv4(), 
					preview: url, 
					fileOrUrl: url 
				}));
				setPhotos(loadedPhotos);
				if (loadedPhotos.length > 0) {
					setAnswers((prev) => ({ ...prev, q0: loadedPhotos[0].preview }));
				}
				if (data.bio) setAnswers((prev) => ({ ...prev, q1: data.bio }));
				if (data.interests) setSelectedInterests(data.interests);
				if (data.gender) setGender(data.gender);
				if (data.preference) setPreference(data.preference);
				if (data.birthdate) setDob(data.birthdate);
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	useEffect(() => {
		if (session?.user?.email) {
			checkProfileCompletion();
		}
	}, [session?.user?.email]);

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
				router.push("/mainpage");
			} else {
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

	if (status === "loading")
		return (
			<div className="min-h-screen bg-background flex justify-center items-center">
				<div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
			</div>
		);

	if (!session?.user) return null;

	const handleChange = (qid: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [qid]: value }));
	};

	const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (!files.length || !session?.user?.email) return;

		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				alert("Please select only image files");
				return;
			}
		}

		if (photos.length + files.length > 6) {
			alert('You can upload up to 6 photos.');
			return;
		}

		setUploading(true);
		
		let compressedImages;
		try {
			compressedImages = await compressMultipleImages(files);
		} catch (error) {
			alert('Failed to process images. Please try again.');
			setUploading(false);
			return;
		}

		try {
			for (const compressed of compressedImages) {
				const formData = new FormData();
				formData.append("photo", compressed.file);
				formData.append("userEmail", session.user.email);

				const response = await fetch("/api/upload-photo", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					const data = await response.json();
					const newPhoto = { 
						id: uuidv4(), 
						preview: data.photoUrl, 
						fileOrUrl: data.photoUrl 
					};
					setPhotos(prev => {
						const updated = [...prev, newPhoto].slice(0, 6);
						if (prev.length === 0) {
							setAnswers(a => ({ ...a, q0: data.photoUrl }));
						}
						return updated;
					});
				} else {
					const error = await response.json();
					alert(`Upload failed: ${error.error}`);
				}
			}
		} catch (error) {
			alert("Failed to upload photo. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const handleDeletePhoto = async (id: string) => {
		const photoToDelete = photos.find(photo => photo.id === id);
		if (!photoToDelete || !session?.user?.email) return;

		if (typeof photoToDelete.fileOrUrl === 'string' && photoToDelete.fileOrUrl.startsWith('http')) {
			try {
				await fetch("/api/delete-photo", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: session.user.email,
						photoUrl: photoToDelete.fileOrUrl
					}),
				});
			} catch (error) {
				console.error("Error deleting photo:", error);
			}
		}

		setPhotos(prev => prev.filter((photo) => photo.id !== id));
		
		if (photos.length > 0 && photos[0].id === id) {
			const remainingPhotos = photos.filter(photo => photo.id !== id);
			if (remainingPhotos.length > 0) {
				setAnswers((prev) => ({ ...prev, q0: remainingPhotos[0].preview }));
			} else {
				setAnswers((prev) => ({ ...prev, q0: null }));
			}
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
			const photoUrls = photos.map(photo => photo.preview);
			const updatedAnswers = {
				...answers,
				q0: photos.length > 0 ? photos[0].preview : null,
				q2: selectedInterests,
				q3: { gender, preference, dob }
			};

			await fetch("/api/update-profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: session.user.email,
					name: session.user.name,
					answers: updatedAnswers,
					profilePhotos: photoUrls,
				}),
			});
			
			setProfileCompleted(true);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			setIsSubmitting(false);
		}
	};

	const currentQ = QUESTIONS[currentQuestion];
	const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
	const isPhotoQuestion = currentQ.isPhotoUpload;
	const canProceed = isPhotoQuestion ? photos.length > 0 : (
		currentQ.isBio ? !!answers[currentQ.id]?.trim() :
		currentQ.isInterests ? selectedInterests.length > 0 :
		currentQ.isGenderPrefDob ? (gender && preference && dob && answers[currentQ.id]?.isValidDob !== false) :
		!!answers[currentQ.id]
	);

	if (isCheckingCompletion) {
		return (
			<div className="min-h-screen bg-background flex justify-center items-center flex-col text-foreground">
				<div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
				<p className="text-lg font-medium">Checking your profile...</p>
			</div>
		);
	}

	if (profileCompleted) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="bg-card border border-border rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
					<div className="text-6xl mb-6">🎉</div>
					<h1 className="text-3xl font-bold text-foreground mb-4">Congratulations!</h1>
					<p className="text-muted-foreground text-lg mb-8 leading-relaxed">
						Your profile has been successfully created. You're all set to connect with amazing people!
					</p>
					<button
						onClick={() => router.push("/mainpage")}
						className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1 w-full shadow-lg"
					>
						Start Exploring Destyn
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
			<CompressionProgress 
				state={compressionState}
				compressionInfo={compressionInfo}
				showCompressionInfo={false}
			/>
			
			<div className="bg-card border border-border rounded-3xl p-6 md:p-10 max-w-xl w-full shadow-2xl relative overflow-hidden">
				
				{/* Progress Bar */}
				<div className="w-full bg-secondary h-2 rounded-full mb-8 overflow-hidden">
					<div
						className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
						style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
					/>
				</div>

				<div className="text-center text-muted-foreground text-sm font-medium mb-6 uppercase tracking-wider">
					Step {currentQuestion + 1} of {QUESTIONS.length}
				</div>

				<h2 className="text-2xl md:text-3xl font-bold text-center mb-8 leading-tight tracking-tight">
					{currentQ.question}
				</h2>

				<div className="min-h-[250px] flex flex-col justify-center">
					{isPhotoQuestion ? (
						<div className="flex flex-col items-center gap-6">
							<div className="grid grid-cols-3 gap-4 mx-auto">
								{photos.map((photo, idx) => (
									<div
										key={photo.id}
										className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl relative overflow-hidden bg-secondary border-2 transition-all ${idx === 0 ? 'border-primary ring-4 ring-primary/20' : 'border-border'}`}
									>
										<img 
											src={photo.preview} 
											alt="Upload" 
											className="w-full h-full object-cover" 
										/>
										<button
											type="button"
											onClick={() => handleDeletePhoto(photo.id)}
											className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
										>
											<span className="text-sm font-bold leading-none">&times;</span>
										</button>
										{idx === 0 && (
											<div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase text-center py-1 tracking-wider">
												Main
											</div>
										)}
									</div>
								))}
								{photos.length < 6 && (
									<label className="w-24 h-24 md:w-28 md:h-28 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center text-primary cursor-pointer transition-all bg-secondary/50">
										<span className="text-3xl font-light mb-1">+</span>
										<span className="text-[10px] uppercase tracking-wider font-semibold">Upload</span>
										<input 
											type="file" 
											accept="image/*" 
											multiple 
											className="hidden" 
											onChange={handlePhotoUpload} 
											disabled={uploading}
										/>
									</label>
								)}
							</div>
							<p className="text-sm text-muted-foreground text-center">
								Add up to 6 photos. The first will be your main photo.
								{photos.length === 0 && <span className="block text-destructive mt-2 font-medium">At least one photo is required</span>}
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-4">
							{currentQ.isBio && (
								<textarea
									value={answers[currentQ.id] || ""}
									onChange={e => handleChange(currentQ.id, e.target.value)}
									placeholder="Share a little bit about what makes you, you..."
									className="w-full h-40 bg-input border border-border rounded-2xl p-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all text-lg"
								/>
							)}
							
							{currentQ.isInterests && (
								<div className="flex flex-wrap gap-3 justify-center mt-2">
									{INTEREST_OPTIONS.map(opt => (
										<button
											key={opt}
											type="button"
											onClick={() => {
												setSelectedInterests(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
											}}
											className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
												selectedInterests.includes(opt) 
												? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' 
												: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
											}`}
										>
											{opt}
										</button>
									))}
								</div>
							)}
							
							{currentQ.isGenderPrefDob && (
								<div className="flex flex-col gap-6 max-w-xs mx-auto w-full">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">I am a</label>
										<select 
											value={gender} 
											onChange={e => setGender(e.target.value)} 
											className="w-full bg-input border border-border rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
										>
											<option value="">Select your gender</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Interested in</label>
										<select 
											value={preference} 
											onChange={e => setPreference(e.target.value)} 
											className="w-full bg-input border border-border rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
										>
											<option value="">Select preference</option>
											<option value="male">Men</option>
											<option value="female">Women</option>
											<option value="everyone">Everyone</option>
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</label>
										<input 
											type="date" 
											value={dob} 
											onChange={e => { 
												const inputDate = e.target.value;
												const selectedDate = new Date(inputDate);
												const today = new Date();
												
												if (isNaN(selectedDate.getTime())) {
													setAnswers(prev => ({ ...prev, [currentQ.id]: { ...prev[currentQ.id], dob: inputDate, isValidDob: false }}));
													setDob(inputDate);
													return;
												}
												
												let age = today.getFullYear() - selectedDate.getFullYear();
												const monthDiff = today.getMonth() - selectedDate.getMonth();
												if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) age--;
												
												setDob(inputDate);
												setAnswers(prev => ({ 
													...prev, 
													[currentQ.id]: { dob: inputDate, isValidDob: (age >= 18 && age <= 100) } 
												}));
											}} 
											className={`w-full bg-input border ${answers[currentQ.id]?.isValidDob === false ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:border-transparent block`}
											max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
										/>
										{answers[currentQ.id]?.isValidDob === false && (
											<p className="text-destructive text-sm font-medium mt-1">You must be at least 18 years old.</p>
										)}
									</div>
								</div>
							)}
							
							{currentQ.options?.map((opt) => (
								<label
									key={opt}
									className={`flex items-center p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
										answers[currentQ.id] === opt
											? 'border-primary bg-primary/10 scale-[1.02]'
											: 'border-border bg-input hover:border-primary/50'
									}`}
								>
									<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${answers[currentQ.id] === opt ? 'border-primary' : 'border-muted-foreground'}`}>
										{answers[currentQ.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
									</div>
									<input
										type="radio"
										name={currentQ.id}
										value={opt}
										checked={answers[currentQ.id] === opt}
										onChange={() => handleChange(currentQ.id, opt)}
										className="hidden"
									/>
									<span className={`text-base md:text-lg font-medium ${answers[currentQ.id] === opt ? 'text-foreground' : 'text-muted-foreground'}`}>
										{opt}
									</span>
								</label>
							))}
						</div>
					)}
				</div>

				<div className="flex justify-between items-center mt-12 pt-6 border-t border-border">
					<button
						onClick={handlePrev}
						disabled={currentQuestion === 0}
						className={`px-6 py-3 rounded-full font-medium transition-all ${currentQuestion === 0 ? 'opacity-0 cursor-default' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
					>
						Previous
					</button>

					{isLastQuestion ? (
						<button
							onClick={handleSubmit}
							disabled={!canProceed || isSubmitting}
							className={`px-8 py-3 rounded-full font-semibold transition-all shadow-lg ${canProceed && !isSubmitting ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5' : 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'}`}
						>
							{isSubmitting ? "Submitting..." : "Complete Profile"}
						</button>
					) : (
						<button
							onClick={handleNext}
							disabled={!canProceed}
							className={`px-8 py-3 rounded-full font-semibold transition-all ${canProceed ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'}`}
						>
							Continue
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
