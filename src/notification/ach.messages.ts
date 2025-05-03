import { AchievementName } from '@/common/enums/ach.enum';

export const achievementMessages: Partial<
  Record<AchievementName, { title: string; body: string }>
> = {
  [AchievementName.BookAtHome]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book at home! Keep it up 🚀`,
  },
  [AchievementName.BookAtWork]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book at work! Keep it up 🚀`,
  },
  [AchievementName.BookInACafe]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book in a café! Keep it up 🚀`,
  },
  [AchievementName.BookInEducationInstitution]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book in an educational institution! Keep it up 🚀`,
  },
  [AchievementName.BookInNature]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book in nature! Keep it up 🚀`,
  },
  [AchievementName.BookInTransport]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book in transport! Keep it up 🚀`,
  },
  [AchievementName.BookOnTheRoad]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book on the road! Keep it up 🚀`,
  },
  [AchievementName.BookInTheLibrary]: {
    title: '🎯 New Achievement!',
    body: `You've completed your first book in the library! Keep it up 🚀`,
  },
  [AchievementName.ThreeBooksByOneAuthor]: {
    title: '🏆 New Achievement!',
    body: `You've read 3 books by one author! Fantastic progress 🚀`,
  },
  [AchievementName.ThreeBooksOfOneGenre]: {
    title: '🏆 New Achievement!',
    body: `You've read 3 books of one genre! Fantastic progress 🚀`,
  },
  [AchievementName.ThreeHorrorBooks]: {
    title: '🏆 New Achievement!',
    body: `You've read 3 horror books! Fantastic progress 🚀`,
  },
  [AchievementName.BookReadInOneDay]: {
    title: '🎯 New Achievement!',
    body: `You read a whole book in one day! Keep it up 🚀`,
  },
  [AchievementName.FriendBook]: {
    title: '🎯 New Achievement!',
    body: `You shared a book with a friend! Keep it up 🚀`,
  },
  [AchievementName.ReadNonStopThirtyDays]: {
    title: '🎯 New Achievement!',
    body: `You read non-stop for 30 days! Amazing streak 🚀`,
  },
};
