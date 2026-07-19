import { Op, Sequelize } from 'sequelize';
import User from '../../Models/user.js';
import moment from 'moment';
import personalDetailsone from '../../Models/personalDetails.model.js';
import imageUploadone from '../../Models/imageUpload.model.js';
import Recommendation from '../../Models/recommendation.model.js';
import Connection from '../../Models/connection.model.js';

export const getUserStatsForAdmin = async (req, res) => {
    try {
        const currentDate = moment();
        const startOfYear = moment().startOf('year');

        // Fetch users for all weeks of the current year
        const weeksStats = [];
        for (let i = 0; i < 52; i++) {
            const startOfWeek = startOfYear.clone().add(i, 'weeks').startOf('week');
            const endOfWeek = startOfYear.clone().add(i, 'weeks').endOf('week');

            if (startOfWeek.isAfter(currentDate)) {
                break;
            }

            const usersThisWeek = await User.count({
                where: {
                    createdAt: {
                        [Op.gte]: startOfWeek.toDate(),
                        [Op.lte]: endOfWeek.toDate(),
                    },
                },
            });

            weeksStats.push({
                week: i + 1,
                users: usersThisWeek,
                startOfWeek: startOfWeek.format('YYYY-MM-DD'),
                endOfWeek: endOfWeek.format('YYYY-MM-DD'),
            });
        }

        // Fetch users for all months of the current year
        const monthsStats = [];
        for (let month = 0; month < 12; month++) {
            const startOfMonth = moment().month(month).startOf('month');
            const endOfMonth = moment().month(month).endOf('month');

            if (startOfMonth.isAfter(currentDate)) {
                break;
            }

            const usersThisMonth = await User.count({
                where: {
                    createdAt: {
                        [Op.gte]: startOfMonth.toDate(),
                        [Op.lte]: endOfMonth.toDate(),
                    },
                },
            });

            monthsStats.push({
                month: startOfMonth.format('MMMM'),
                users: usersThisMonth,
                startOfMonth: startOfMonth.format('YYYY-MM-DD'),
                endOfMonth: endOfMonth.format('YYYY-MM-DD'),
            });
        }

        // Fixed: Fetch users grouped by year
        const yearsStats = await User.findAll({
            attributes: [
                [Sequelize.fn('date_part', 'year', Sequelize.col('createdAt')), 'year'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'users'],
            ],
            group: ['year'],
            order: [['year', 'ASC']],
            raw: true
        });

        // Format the years data consistently
        const formattedYearsStats = yearsStats.map(stat => ({
            year: parseInt(stat.year),
            users: parseInt(stat.users),
        }));

        // Prepare the complete response
        const responseData = {
            weeksStats,
            monthsStats,
            yearsStats: formattedYearsStats,
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ error: 'An error occurred while fetching user statistics.' });
    }
};  
export const getNewUserAdded = async (req, res) => {
    try {
        // Get current date and calculate ranges
        const now = new Date();
        
        // Today's start and end
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        // This week's start (Monday) and end (Sunday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // This month's start and end
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // Get users created today, this week, and this month based on userId
        const users = await User.findAll({
            where: {
                createdAt: {
                    [Op.gte]: monthStart,  // Adjust this to get users for the last month
                    [Op.lte]: monthEnd,
                },
            },
            order: [['createdAt', 'DESC']],
        });

        // Fetch personal details and profile pic for each user based on userId
        const fetchUserDetails = async (userId) => {
            const personalDetails = await personalDetailsone.findOne({
                where: { userId },
                attributes: ['firstName']
            });

            const profilePic = await imageUploadone.findOne({
                where: { userId },
                attributes: ['image']
            });

            return {
                firstName: personalDetails ? personalDetails.firstName : 'N/A',
                profilePic: profilePic ? profilePic.image : null
            };
        };

        // Filter users by time periods (today, this week, this month)
        const todayUsers = users.filter(user => 
            user.createdAt >= todayStart && user.createdAt <= todayEnd
        );
        
        const weekUsers = users.filter(user => 
            user.createdAt >= weekStart && user.createdAt <= weekEnd
        );
        
        const monthUsers = users.filter(user => 
            user.createdAt >= monthStart && user.createdAt <= monthEnd
        );

        // Format the response - get user details by userId
        const formatUsers = async (users) => {
            const usersWithDetails = [];
            for (const user of users) {
                const details = await fetchUserDetails(user.userId);  // Fetch personal details and profile pic
                usersWithDetails.push({
                    userId: user.userId,
                    firstName: details.firstName,
                    profilePic: details.profilePic,
                    createdAt: user.createdAt
                });
            }
            return usersWithDetails;
        };

        // Format the users
        const todayUsersFormatted = await formatUsers(todayUsers);
        const weekUsersFormatted = await formatUsers(weekUsers);
        const monthUsersFormatted = await formatUsers(monthUsers);

        // Prepare the response
        const response = {
            today: {
                count: todayUsersFormatted.length,
                users: todayUsersFormatted
            },
            thisWeek: {
                count: weekUsersFormatted.length,
                users: weekUsersFormatted
            },
            thisMonth: {
                count: monthUsersFormatted.length,
                users: monthUsersFormatted
            },
            total: {
                count: users.length
            }
        };

        res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
};



export const getGenderRatio = async (req, res) => {
    try {
        // Count the total number of users with a filled gender field
        const totalUsersWithGender = await Recommendation.count({
            where: {
                gender: {
                    [Op.ne]: null // Only count users who have a gender specified
                }
            }
        });

        // Count the number of male and female users
        const maleCount = await Recommendation.count({
            where: {
                gender: 'Man'
            }
        });

        const femaleCount = await Recommendation.count({
            where: {
                gender: 'Woman'
            }
        });

        // If no users with gender data, return an appropriate message
        if (totalUsersWithGender === 0) {
            return res.status(200).json({
                success: true,
                message: "No users with gender information available."
            });
        }

        // Calculate the gender ratio for every 100 users
        const maleRatio = ((maleCount / totalUsersWithGender) * 100).toFixed(2);
        const femaleRatio = ((femaleCount / totalUsersWithGender) * 100).toFixed(2);

        // Return the gender ratio
        const genderRatio = {
            totalUsersWithGender,
            maleCount,
            femaleCount,
            maleRatio,
            femaleRatio
        };

        res.status(200).json({
            success: true,
            data: genderRatio
        });
    } catch (error) {
        console.error('Error fetching gender ratio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gender ratio',
            error: error.message
        });
    }
};



// Utility function to calculate profile completion percentage
const calculateFilledPercentage = (filledFields, totalFields) => {
    return totalFields > 0 ? ((filledFields / totalFields) * 100).toFixed(2) : 0;
};

// Function to calculate profile completion statistics
export const getProfileCompletionStats = async (req, res) => {
    try {
        // Step 1: Get all users and all recommendations
        const users = await User.findAll();
        const recommendations = await Recommendation.findAll();
        
        // Create a map of recommendations by userId for quick lookup
        const recommendationMap = new Map();
        recommendations.forEach(rec => {
            recommendationMap.set(rec.userId, rec);
        });

        // Define fields to check for each table
        const userFields = [
            'uid', 'userStatus', 'fcmToken', 'email', 'otp', 'password', 'usertype',
            'isVerified', 'isPersonalFormFilled', 'isQualificationFormFilled', 
            'isLocationFormFilled', 'isOtherFormFilled', 'isImageFormFilled', 'role'
        ];

        const recommendationFields = [
            'qualification', 'currentWorkingStatus', 'occupation', 'income', 
            'firstName', 'lastName', 'displayName', 'contactNumber', 'maritalStatus', 
            'numberOfChildren', 'aboutYourSelf', 'caste', 'community', 'subCommunity', 
            'dateOfBirth', 'timeOfBirth', 'religion', 'placeOfBirth', 'motherTongue', 
            'gotra', 'height', 'weight', 'bodyType', 'language', 'smokingHabbit', 
            'drinkingHabbit', 'diet', 'complexion', 'fatherOccupation', 'motherOccupation', 
            'siblings', 'numberOfSiblings', 'livingWithFamily', 'country', 'state', 
            'currentLocation', 'cityOfResidence', 'nationality', 'gender', 'lookingFor', 
            'age', 'lookingPartnerAge', 'horoscopeMatch', 'castReligionMatterOrNot', 
            'interest_and_hobbies', 'image'
        ];

        const totalFields = userFields.length + recommendationFields.length;

        // Initialize profile completion counters
        const profileCompletionCounts = {
            '0-29%': 0,
            '30-49%': 0,
            '50-79%': 0,
            '80-99%': 0,
            '100%': 0
        };

        // Process each user
        for (const user of users) {
            let filledFields = 0;

            // Count filled fields in User table
            userFields.forEach(field => {
                if (user[field] !== null && user[field] !== "" && user[field] !== undefined) {
                    filledFields++;
                }
            });

            // Get the recommendation for this user
            const recommendation = recommendationMap.get(user.userId);

            // Count filled fields in Recommendation table if exists
            if (recommendation) {
                recommendationFields.forEach(field => {
                    const value = recommendation[field];
                    if (value !== null && value !== "" && value !== undefined) {
                        // Special handling for array/object fields
                        if (field === 'interest_and_hobbies' && Array.isArray(value) && value.length > 0) {
                            filledFields++;
                        } else if (field === 'image' && value && Object.keys(value).length > 0) {
                            filledFields++;
                        } else if (field !== 'interest_and_hobbies' && field !== 'image') {
                            filledFields++;
                        }
                    }
                });
            }

            // Calculate percentage
            const filledPercentage = calculateFilledPercentage(filledFields, totalFields);

            // Categorize the user
            if (filledPercentage >= 100) {
                profileCompletionCounts['100%']++;
            } else if (filledPercentage >= 80) {
                profileCompletionCounts['80-99%']++;
            } else if (filledPercentage >= 50) {
                profileCompletionCounts['50-79%']++;
            } else if (filledPercentage >= 30) {
                profileCompletionCounts['30-49%']++;
            } else {
                profileCompletionCounts['0-29%']++;
            }
        }

        // Calculate percentages
        const totalUsers = users.length;
        const profileCompletionStats = {};

        for (const [range, count] of Object.entries(profileCompletionCounts)) {
            profileCompletionStats[range] = totalUsers > 0 
                ? ((count / totalUsers) * 100).toFixed(2) + '%'
                : '0.00%';
        }

        // Return the response
        res.status(200).json({
            success: true,
            totalUsers,
            profileCompletionStats
        });

    } catch (error) {
        console.error('Error fetching profile completion stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile completion stats',
            error: error.message
        });
    }
};







 // Adjust path to your Connection model

export const getConnectionStats = async (req, res) => {
    try {
        // Get the total number of connections for each status
        const connectionStats = await Connection.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
                'status'
            ],
            group: ['status'],
            raw: true
        });

        // Format the data into an easier-to-read object
        const stats = {
            acceptedConnections: 0,
            rejectedConnections: 0,
            pendingConnections: 0,
            cancelledConnections: 0
        };

        // Loop through the result to map the counts to the corresponding statuses
        connectionStats.forEach(stat => {
            if (stat.status === 'accepted') {
                stats.acceptedConnections = parseInt(stat.count, 10);
            } else if (stat.status === 'rejected') {
                stats.rejectedConnections = parseInt(stat.count, 10);
            } else if (stat.status === 'pending') {
                stats.pendingConnections = parseInt(stat.count, 10);
            } else if (stat.status === 'cancelled') {
                stats.cancelledConnections = parseInt(stat.count, 10);
            }
        });

        // Send the response with the connection stats
        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching connection stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch connection stats',
            error: error.message
        });
    }
};
