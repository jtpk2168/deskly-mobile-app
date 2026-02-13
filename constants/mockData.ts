export type MockProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    minMonths: number;
    image: string;
    video: string;
    description: string;
    rating: number;
    reviews: number;
    tagline: string;
    videoCaption: string;
};

export const PRODUCTS: MockProduct[] = [
    {
        id: "1",
        name: "Elevate Standing Desk Pro",
        category: "Desks",
        price: 45,
        minMonths: 3,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDV5dAfVdWM5FL1tMGFjKh7A7T3ZJZppo_MvtoToiYKDjKDh_WjrsRhrXX51AEd3xVz4CVohZ5QMNLoXwrKGuClIJOiZRE9FpRu6rys2zNQTbX0CNKAmZ9FBXD_JSeNXUkrE6gNcTMvhZTjhWHE63ej1xst0rC6KvEUmzmMfvype8dV_CG5RahwUcxawH_FIy266x8C67onuEOoZFzEC2iJcwKSo95EDIiZC9FA6sfliLu-dcKbuiQCKPXeGOCmHgXUtOln9GYjp8Q",
        video: "https://videos.pexels.com/video-files/6794245/6794245-uhd_1440_2732_25fps.mp4",
        description:
            "An ergonomic masterpiece designed for productivity. Features a silent dual-motor lifting system and cable management.",
        rating: 4.9,
        reviews: 84,
        tagline: "This one just RM 45 per month! 🔥",
        videoCaption: "Upgrade your workspace with the ultimate standing desk — silent motors, built-in cable management.",
    },
    {
        id: "2",
        name: "Aeron Comfort Chair",
        category: "Chairs",
        price: 89,
        minMonths: 6,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFae5QmeJZ-cjAj9jyAu2V2zfB-smvkG5MXK8ylv0KMHoztbr6ZP_GtTFWjFt0apo8noX-9MhpsrbxhaGaC0snZWfjmd2kms3m5jtBBEKRFILYtZ6GXAZTJwtR_2CknxRiO8kTAKZJdUMz00SDkf7FScsC7x7hxZtowqdzh0FbymLfGcf9GIJjuQ40FBUM2nyKM-cwqYD_6zDFuPIUbmIXcvzojFnThsxQ-t-kWPOlGdTxydLc7IC-oGaFyrzuehackC5WWH9uopI",
        video: "https://videos.pexels.com/video-files/7579554/7579554-uhd_1440_2732_25fps.mp4",
        description:
            "The industry standard for ergonomic seating. Multi-zone support, breathable mesh, and all-day comfort.",
        rating: 4.8,
        reviews: 120,
        tagline: "RM 89/mo for all-day comfort! 💺",
        videoCaption: "The chair that'll save your back — breathable mesh, multi-zone lumbar support.",
    },
    {
        id: "3",
        name: "Oak Meeting Table",
        category: "Meeting",
        price: 120,
        minMonths: 1,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVY641aBRgeCqsP7mcV7ePsU8W1LyRzWUG9WY-BWCK9YaJ9fVEBkQxw8F4waFX5dwHwYBJaaPxbiKfHrcAsr3xaogH3KbBXmy13XAlxMQT7UYaxPRZGBVOqgpqCB2pug8EffA6-zzRbSlRLTnIGIUZSkQJcnh5FRbVLr3vzj9uwyLpC5Im58t7Glkf45HrosTi0a9bCTwtyuQWqHLikWbhFO6UvMVY_QRZZsfbuRRSEvqC9Rc4IOhjjHIXCGUiAZ1WQVIs36vZs90",
        video: "https://videos.pexels.com/video-files/6980626/6980626-uhd_1440_2732_25fps.mp4",
        description:
            "Handcrafted solid oak meeting table designed for high-stakes collaborative sessions.",
        rating: 4.7,
        reviews: 45,
        tagline: "Impress clients — from RM 120/mo! 🤝",
        videoCaption: "Solid oak, handcrafted for the boardroom. Flexible 1-month minimum rental.",
    },
    {
        id: "4",
        name: "Oxford Executive Chair",
        category: "Chairs",
        price: 150,
        minMonths: 3,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAe-3Lp8txzOwxL01rEPMVVZe2NGE9Y4A6aK_SP6AWXfE1HiFxx8MEHwWpu-EIbUIKanYsHYr3lcEHyvJacc25ad0lIm2ZrdA_u_7PU0eFDCWYGDFYBIwyvJdCRoNwTkWimy55fUeFaitcqwkMeABKYDC6uRZXd_C5d50GImCF-PvfBaVXRj2RySSO2T4YoIUCA5BFURYcicK8Nn3J_d2wEAuIv5FdTLEexz6f9UbIO0cTER6XC3PILu8RiHHDlJ1JX4QgiV4NYIoA",
        video: "https://videos.pexels.com/video-files/5327022/5327022-uhd_1440_2732_25fps.mp4",
        description:
            "Premium leather executive chair with polished aluminum base and precision lumbar support.",
        rating: 4.9,
        reviews: 62,
        tagline: "The CEO seat — RM 150/mo! 👔",
        videoCaption: "Premium leather, polished aluminum — the executive chair that means business.",
    },
];

export const getProductById = (id?: string) => PRODUCTS.find((product) => product.id === id);
