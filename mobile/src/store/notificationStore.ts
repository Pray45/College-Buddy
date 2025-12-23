import { create } from 'zustand';

type Notification = {
    from: string
    to: string[] | 'all'
    title: string
    title_img: string | null
    description: string
    attechments: string[] | null
    links: string[] | null
    timestamp: number
}

type NotificationState = {

    notifications: Notification[];

}


const useNotificationStore = create<NotificationState>((set, get) => ({

    notifications: [
        {
            from: "Admin",
            to: "all",
            title: "Welcome to College Buddy!",
            title_img: null,
            description: "Stay updated with the latest news and events happening on campus. Check back often for new updates!",
            attechments: null,
            links: null,
            timestamp: Date.now() - 86400000, // 1 day ago
        }
    ],

}))

export default useNotificationStore;