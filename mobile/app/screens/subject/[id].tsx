import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/config/axios";
import { extractErrorMessage } from "@/src/utils/extractErrorMessage";
import AssignDivisionToSubject from "@/app/components/AssignDivisionToSubject";
import colors from "@/src/config/colors";

type SubjectDetails = {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	departmentId: string;
	semesterId: string;
	department?: { id: string; name: string } | null;
	semester?: { id: string; number: number } | null;
	DivisionSubjectAssignment?: Array<{
		id: string;
		divisionId: string;
		Division?: { id: string; name: string } | null;
		Professor?: {
			id: string;
			teacherId?: string;
			User?: { id: string; name: string; email: string } | null;
		} | null;
	}>;
	StudentSubject?: Array<{
		id: string;
		status: string;
		enrolledAt: string;
		Student?: {
			id: string;
			enrollmentNo: string;
			divisionId?: string | null;
			User?: { id: string; name: string; email: string } | null;
			Division?: { id: string; name: string } | null;
		} | null;
	}>;
};

const SubjectDetailsScreen = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id?: string }>();
	const [subject, setSubject] = useState<SubjectDetails | null>(null);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expandedDivision, setExpandedDivision] = useState<string | null>(null);
	const [deassigning, setDeassigning] = useState<string | null>(null);

	const handleDeassign = (assignmentId: string, divisionName: string) => {
		Alert.alert(
			"Deassign Division",
			`Remove Division ${divisionName} from this subject? This will also unenroll all students of that division.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Deassign",
					style: "destructive",
					onPress: async () => {
						setDeassigning(assignmentId);
						try {
							await api.delete("/assign-tchr/delete", { data: { id: assignmentId } });
							Alert.alert("Success", "Division deassigned successfully");
							setExpandedDivision(null);
							fetchDetails(true);
						} catch (err: string | any) {
							Alert.alert("Error", extractErrorMessage(err));
						} finally {
							setDeassigning(null);
						}
					},
				},
			]
		);
	};

	const fetchDetails = async (isRefresh = false) => {
		if (!id) return;
		isRefresh ? setRefreshing(true) : setLoading(true);
		setError(null);
		try {
			const res = await api.get(`/subject/details/${id}`);
			setSubject(res.data?.data?.subject ?? null);
		} catch (err: string | any) {
			setError(extractErrorMessage(err));
		} finally {
			isRefresh ? setRefreshing(false) : setLoading(false);
		}
	};

	useEffect(() => {
		fetchDetails();
	}, [id]);

	const assignments = subject?.DivisionSubjectAssignment ?? [];
	const students = subject?.StudentSubject ?? [];

	if (!id) {
		return (
			<View className="flex-1 bg-primary px-5 py-6">
				<Text className="text-white text-lg">Missing subject id.</Text>
			</View>
		);
	}

	if (loading && !subject) {
		return (
			<View className="flex-1 bg-primary px-5 py-6 justify-center items-center">
				<ActivityIndicator color={colors.accentBright} size="large" />
				<Text className="text-textMuted mt-4">Loading subject details...</Text>
			</View>
		);
	}

	if (!subject && error) {
		return (
			<View className="flex-1 bg-primary px-5 py-6 gap-4">
				<TouchableOpacity
					onPress={() => router.back()}
					className="w-10 h-10 rounded-full bg-secondary items-center justify-center border border-white/10"
				>
					<Ionicons name="arrow-back" size={20} color={colors.textWhite} />
				</TouchableOpacity>
				<Text className="text-white text-xl font-semibold">Unable to load subject</Text>
				<Text className="text-textMuted">{error}</Text>
				<TouchableOpacity
					onPress={() => fetchDetails()}
					className="bg-accent/20 px-4 py-2 rounded-full border border-accent/40 self-start"
				>
					<Text className="text-accent font-semibold">Try again</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!subject) {
		return (
			<View className="flex-1 bg-primary px-5 py-6 gap-4">
				<TouchableOpacity
					onPress={() => router.back()}
					className="w-10 h-10 rounded-full bg-secondary items-center justify-center border border-white/10"
				>
					<Ionicons name="arrow-back" size={20} color={colors.textWhite} />
				</TouchableOpacity>
				<Text className="text-white text-xl font-semibold">Subject not found</Text>
				<Text className="text-textMuted">Try refreshing subjects and open again.</Text>
			</View>
		);
	}

	const totalTeachers = assignments.filter((a) => a.Professor?.User?.id).length;

	return (
		<ScrollView
			className="flex-1 bg-primary px-5 py-6"
			showsVerticalScrollIndicator={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDetails(true)} />}
		>
			<Stack.Screen options={{ title: subject.name, headerShown: false }} />

			{/* Back */}
			<TouchableOpacity
				onPress={() => router.back()}
				className="mb-5 w-11 h-11 rounded-full bg-secondary items-center justify-center border border-white/10"
			>
				<Ionicons name="arrow-back" size={20} color={colors.textWhite} />
			</TouchableOpacity>

			{/* Subject Info Card */}
			<View className="bg-gradient-to-br from-gradientFrom to-gradientTo p-6 rounded-3xl border border-white/10 shadow-md shadow-black/40 mb-4">
				<Text className="text-white text-3xl font-extrabold">{subject.name}</Text>
				<Text className="text-textLight text-base mt-1">Code: {subject.code}</Text>
				<Text className="text-textMuted text-sm mt-2">
					{subject.description || "No description provided."}
				</Text>

				<View className="mt-5 flex-row gap-3 flex-wrap">
					<View className="bg-textPrimary px-4 py-2 rounded-full border border-accent/40">
						<Text className="text-accent text-sm font-semibold">{students.length} Students</Text>
					</View>
					<View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
						<Text className="text-textLight text-sm font-semibold">{assignments.length} Divisions</Text>
					</View>
					<View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
						<Text className="text-textLight text-sm font-semibold">{totalTeachers} Teachers</Text>
					</View>
					<View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
						<Text className="text-textLight text-sm font-semibold">
							Dept: {subject.department?.name ?? subject.departmentId}
						</Text>
					</View>
					<View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
						<Text className="text-textLight text-sm font-semibold">
							Semester {subject.semester?.number ?? subject.semesterId}
						</Text>
					</View>
				</View>
			</View>

			{/* Assign Division Component */}
			<AssignDivisionToSubject
				subjectId={subject.id}
				departmentId={subject.departmentId}
				assignedDivisionIds={assignments.map((a) => a.Division?.id ?? a.divisionId)}
				onAssigned={() => fetchDetails(true)}
			/>

			{/* Assigned Divisions */}
			<View className="bg-secondary p-5 rounded-2xl border border-white/10 shadow-sm shadow-black/30 mb-4">
				<View className="flex-row items-center justify-between mb-3">
					<Text className="text-white text-lg font-semibold">Assigned Divisions</Text>
					<View className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
						<Text className="text-textLight text-xs">{assignments.length} total</Text>
					</View>
				</View>

				{assignments.length === 0 ? (
					<Text className="text-textMuted">No divisions assigned yet. Use the form above to assign one.</Text>
				) : (
					assignments.map((assignment) => {
						const divId = assignment.Division?.id ?? assignment.divisionId;
						const isExpanded = expandedDivision === divId;
						const divStudents = students.filter(
							(e) =>
								e.Student?.divisionId === divId ||
								e.Student?.Division?.id === divId
						);

						return (
							<View key={assignment.id} className="mb-3">
								{/* Division Row */}
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => setExpandedDivision(isExpanded ? null : divId)}
									className={`p-4 rounded-xl border flex-row items-center justify-between ${
										isExpanded
											? "bg-accent/10 border-accent/40"
											: "bg-black/25 border-white/5"
									}`}
								>
									<View className="flex-1">
										<Text className="text-white font-semibold text-base">
											Division {assignment.Division?.name ?? assignment.divisionId}
										</Text>
										<View className="flex-row items-center gap-3 mt-1">
											<Text className="text-textMuted text-xs">
												{assignment.Professor?.User?.name ?? "No teacher"}
											</Text>
											<Text className="text-textDim text-xs">
												• {divStudents.length} students
											</Text>
										</View>
									</View>
									<Ionicons
										name={isExpanded ? "chevron-up" : "chevron-down"}
										size={18}
										color={isExpanded ? colors.accentBright : colors.textMuted}
									/>
								</TouchableOpacity>

								{/* Expanded Details */}
								{isExpanded && (
									<View className="mt-2 ml-2 border-l-2 border-accent/30 pl-4">
										{/* Teacher Info */}
										<View className="mb-3 p-3 rounded-lg bg-black/20 border border-white/5">
											<Text className="text-textMuted text-xs font-semibold uppercase tracking-wider mb-2">
												Teacher
											</Text>
											{assignment.Professor?.User ? (
												<View>
													<Text className="text-white font-semibold">
														{assignment.Professor.User.name}
													</Text>
													<Text className="text-textMuted text-sm">
														{assignment.Professor.User.email}
													</Text>
												</View>
											) : (
												<Text className="text-textDim text-sm">No teacher assigned</Text>
											)}
										</View>
									{/* Deassign Button */}
									<TouchableOpacity
										onPress={() =>
											handleDeassign(
												assignment.id,
												assignment.Division?.name ?? assignment.divisionId
											)
										}
										disabled={deassigning === assignment.id}
										className="mb-3 p-3 rounded-lg bg-danger/10 border border-danger/30 flex-row items-center justify-between"
									>
										<View>
											<Text className="text-danger font-semibold text-sm">
												Deassign Division
											</Text>
											<Text className="text-dangerText/70 text-xs mt-0.5">
												Removes teacher & unenrolls all students
											</Text>
										</View>
										{deassigning === assignment.id ? (
											<ActivityIndicator size="small" color={colors.danger} />
										) : (
											<Ionicons name="trash" size={18} color={colors.danger} />
										)}
									</TouchableOpacity>
										{/* Students */}
										<View className="p-3 rounded-lg bg-black/20 border border-white/5">
											<View className="flex-row items-center justify-between mb-2">
												<Text className="text-textMuted text-xs font-semibold uppercase tracking-wider">
													Students
												</Text>
												<View className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
													<Text className="text-textLight text-xs">{divStudents.length}</Text>
												</View>
											</View>

											{divStudents.length === 0 ? (
												<Text className="text-textDim text-sm">
													No students enrolled from this division.
												</Text>
											) : (
												divStudents.map((enrollment) => (
													<View
														key={enrollment.id}
														className="mb-2 p-3 rounded-lg bg-black/30 border border-white/5"
													>
														<View className="flex-row items-center justify-between">
															<View className="flex-1">
																<Text className="text-white font-semibold text-sm">
																	{enrollment.Student?.User?.name ?? "Unnamed"}
																</Text>
																<Text className="text-textMuted text-xs">
																	{enrollment.Student?.User?.email ?? "No email"}
																</Text>
															</View>
															<View className="flex-row gap-2">
																{enrollment.Student?.enrollmentNo && (
																	<View className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
																		<Text className="text-textLight text-xs">
																			{enrollment.Student.enrollmentNo}
																		</Text>
																	</View>
																)}
																<View
																	className={`px-2 py-0.5 rounded-full border ${
																		enrollment.status === "ACTIVE"
																			? "bg-accent/20 border-accent/40"
																			: "bg-white/5 border-white/10"
																	}`}
																>
																	<Text
																		className={`text-xs font-semibold ${
																			enrollment.status === "ACTIVE"
																				? "text-accent"
																				: "text-textLight"
																		}`}
																	>
																		{enrollment.status}
																	</Text>
																</View>
															</View>
														</View>
													</View>
												))
											)}
										</View>
									</View>
								)}
							</View>
						);
					})
				)}
			</View>

			{/* Bottom spacer */}
			<View className="h-8" />
		</ScrollView>
	);
};

export default SubjectDetailsScreen;
