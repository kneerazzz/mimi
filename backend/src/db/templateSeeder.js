/**
 * Configuration data for all meme templates.
 *
 * NOTE: All remaining templates have Cloudinary URLs and are ready for use.
 *
 * The x, y, width, and height coordinates are normalized (0-100),
 * representing percentages of the image size.
 */
const initialTemplates = [
    {
        templateId: "11",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918495/11_k4wv1j.webp",
        name: "Worse Than a Slave YouTube Thumbnail Parody",
        tags: [
            "youtube", "thumbnail", "clickbait", "albania", "life-is-hard",
            "comparison", "exaggeration", "dramatization", "parody",
            "misleading", "title-change"
        ],
        textRegions: [
            // Region 1: Main Title text replacement
            { name: "Main Title", x: 50, y: 30, width: 45, height: 30 },
            // Region 2: Bottom Title/Question replacement
            { name: "Bottom Question", x: 10, y: 80, width: 50, height: 10 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "12",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918495/12_scwk1j.webp",
        name: "Frog Mascot Confronting Police",
        tags: [
            "frog", "mascot", "police", "protest", "confrontation",
            "unexpected", "out-of-place", "surreal", "weird-scenario",
            "authority", "clash", "normal-day-in"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "13",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918497/13_wouq66.webp",
        name: "Devil and Man Choosing Doors",
        tags: [
            "choice", "decision", "thinking", "indecisive", "hell",
            "devil", "doors", "options", "dilemma", "procrastination",
            "fate", "whats-it-gonna-be", "label-meme"
        ],
        textRegions: [
            { name: "Door 1 Label", x: 55, y: 40, width: 15, height: 25 },
            { name: "Door 2 Label", x: 75, y: 40, width: 15, height: 25 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "14",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918499/14_wsuits.webp",
        name: "Single Man Surrounded by Crowd",
        tags: [
            "one-vs-many", "crowd", "pressure", "confrontation",
            "challenge", "alone", "stand-out", "protagonist",
            "minority-opinion", "anime", "manga", "question-mark", "intense"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "20",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918496/20_rikmrv.webp",
        name: "News Reporter Looking Sideways Shocked",
        tags: [
            "shocked", "surprised", "news-clip", "reaction", "unexpected-event",
            "realization", "side-eye", "awkward", "fox-news",
            "caption-on-bottom", "staring"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 },
            // Text Region for the headline, so it can be changed.
            { name: "News Headline Text", x: 20, y: 70, width: 75, height: 10 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "21",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918499/21_glg8dc.webp",
        name: "News Reporter Double Take/Forward Shock",
        tags: [
            "shocked", "surprised", "double-take", "news-clip", "reaction",
            "realization", "unexpected", "staring", "what-did-i-just-see",
            "caption-on-bottom", "two-panel"
        ],
        textRegions: [
            { name: "Top Panel Caption", x: 5, y: 5, width: 90, height: 20 },
            { name: "Bottom Panel Caption", x: 5, y: 50, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },

    {
        templateId: "22",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918498/22_k9tzyb.webp",
        name: "Bernie Sanders I Am No Longer Asking (Gun)",
        tags: [
            "bernie-sanders", "i-am-no-longer-asking", "threat", "demand",
            "political", "forcing", "insistence", "gun",
            "funny-threat", "senator", "relatable-demand"
        ],
        textRegions: [
            // Text is pre-existing but can be replaced or added to the bottom
            { name: "Custom Top Text", x: 5, y: 5, width: 90, height: 10 },
            { name: "Bottom Text Replacement", x: 5, y: 80, width: 90, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    
    // --- CLOUDINARY URL TEMPLATES ---

    {
        templateId: "27",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918497/27_satjwh.webp",
        name: "Disappointed Man Crossing Arms / Skepticism",
        tags: [
            "skepticism", "disappointment", "judging", "unimpressed",
            "disapproval", "side-eye", "waiting", "reluctant", "unbelieving",
            "doubt", "body-language"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "28",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918499/28_k0xa93.webp",
        name: "Two Men Laughing and Pointing / Shared Joke",
        tags: [
            "mocking", "laughing", "pointing", "shared-joke", "humor",
            "agreement", "realization", "schadenfreude", "insulting", "funny"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "29",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918503/29_j3itxy.webp",
        name: "Unequal Handshake / Two Sides of the Deal",
        tags: [
            "business", "deal", "handshake", "comparison", "effort",
            "quality", "one-is-better", "deception", "expectations-vs-reality",
            "trade", "partnership", "superiority"
        ],
        textRegions: [
            { name: "Left Hand Label", x: 5, y: 5, width: 40, height: 10 },
            { name: "Right Hand Label", x: 55, y: 5, width: 40, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "30",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918511/30_pi7298.webp",
        name: "Doge (Original Shiba Inu)",
        tags: [
            "doge", "shiba", "dog", "such-wow", "very-meme",
            "classic", "confusion", "amazement", "interior-monologue",
            "surreal", "cute", "internet-culture"
        ],
        textRegions: [
            { name: "Center Text", x: 30, y: 10, width: 40, height: 15 },
            { name: "Bottom Text", x: 30, y: 70, width: 40, height: 15 },
            { name: "Small Top Right", x: 70, y: 5, width: 20, height: 10 },
            { name: "Small Bottom Left", x: 10, y: 80, width: 20, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "35",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918498/35_dmn6il.webp",
        name: "Sharp Turn of Head / Sudden Realization",
        tags: [
            "realization", "shock", "turning-around", "surprise", "unexpected",
            "regret", "oh-no", "pause", "attention-grab", "look-back", "sudden-thought"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "36",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918497/36_gzflcf.webp",
        name: "Confused Guy Looking at Other Guy",
        tags: [
            "confusion", "reaction", "misunderstanding", "disagreement", "weird",
            "what-are-you-doing", "explaining", "baffled", "uncomfortable",
            "staring", "awkward-silence"
        ],
        textRegions: [
            { name: "Confused Guy Label", x: 5, y: 5, width: 40, height: 10 },
            { name: "Other Guy Label", x: 55, y: 5, width: 40, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "37",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918512/37_pxhlrt.webp",
        name: "Creation of Adam Fingers Barely Touching",
        tags: [
            "closeness", "near-miss", "touching-tips", "inspiration", "moment-of-creation",
            "close-enough", "almost", "connection", "michelangelo", "art-parody"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 },
            { name: "Bottom Caption", x: 5, y: 80, width: 90, height: 15 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "38",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918514/38_kirkhs.webp",
        name: "Shocked Pikachu",
        tags: [
            "pikachu", "pokemon", "shocked", "surprised", "unexpected",
            "reaction", "realization", "surprised-face", "predictable-consequence",
            "what-did-you-expect", "awe"
        ],
        requireAdvancedEditor: false,
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ]
    },
    {
        templateId: "43",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918513/43_ujvokp.webp",
        name: "Man Looking Intently at Small Object",
        tags: [
            "focus", "contemplation", "examining", "small-object", "discovery",
            "looking-down", "curiosity", "interest", "inspection", "finding"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "44",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918514/44_tmmch5.webp",
        name: "Alone in the Rain / Contemplation",
        tags: [
            "sad", "contemplation", "lonely", "rain", "cinematic",
            "depressing", "thinking", "isolation", "realization", "melancholy",
            "feeling-down"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "45",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918522/45_wn6dtq.webp",
        name: "Aggressive Discussion / Argument",
        tags: [
            "argument", "discussion", "debate", "yelling", "aggressive",
            "confrontation", "explaining", "listening", "misunderstanding",
            "loud", "frustration"
        ],
        textRegions: [
            { name: "Yeller's Speech", x: 5, y: 5, width: 40, height: 20 },
            { name: "Listener's Reaction", x: 55, y: 5, width: 40, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "46",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918524/46_bcxwtw.webp",
        name: "Elizabethan Women Overlooking Sugar Plantation",
        tags: [
            "history", "colonial", "sugar", "plantation", "slavery",
            "historical-irony", "rich-vs-poor", "speech-bubble", "dark-humor",
            "aristocracy", "commentary"
        ],
        textRegions: [
            { name: "Speech Bubble Text", x: 60, y: 20, width: 30, height: 15 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "51",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918513/51_lt0qyg.webp",
        name: "The Rock Raising Eyebrow / Disapproving Look",
        tags: [
            "the-rock", "dwayne-johnson", "eyebrow", "skepticism", "unimpressed",
            "disapproval", "confusion", "reaction", "judging", "wrestling",
            "side-eye"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "52",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918521/52_vcpkbm.webp",
        name: "Man Putting on Glasses / Clarity",
        tags: [
            "realization", "clarity", "seeing-the-truth", "understanding", "insight",
            "putting-on-glasses", "awakening", "before-after", "intelligence",
            "vision"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "53",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918522/53_ulqqnc.webp",
        name: "Man Staring at Screen in Awe",
        tags: [
            "awe", "wonder", "impressed", "technology", "screen",
            "gaming", "surprised", "discovery", "intense-focus", "reaction",
            "cinematic"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "54",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918523/54_evxqf5.webp",
        name: "Man Yelling at Laptop / Stress",
        tags: [
            "stress", "frustration", "work-from-home", "computer", "yelling",
            "angry", "technology-issues", "relatable", "zoom-call", "rage",
            "desk"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "59",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918521/59_gf8ktq.webp",
        name: "Whispering Man in Suit / Gossip",
        tags: [
            "whispering", "secret", "gossip", "sharing-information", "business",
            "conspiracy", "confidential", "warning", "advice", "hush",
            "two-person"
        ],
        textRegions: [
            { name: "Whisper Text", x: 5, y: 5, width: 40, height: 10 },
            { name: "Listener Reaction", x: 55, y: 5, width: 40, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "60",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918522/60_di3efq.webp",
        name: "Wildly Expressive Face / Insanity",
        tags: [
            "crazy", "wild", "expressive", "intense", "over-the-top",
            "excited", "insane", "mad-scientist", "reaction", "enthusiasm",
            "exaggerated"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "61",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918523/61_j2zwpt.webp",
        name: "Unsure Hesitant Smile / Awkward",
        tags: [
            "unsure", "hesitant", "awkward", "nervous-smile", "fake-confidence",
            "reluctant", "trying-to-be-brave", "reaction", "cringe",
            "embarrassed"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "bigLeagues",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918523/bigLeagues_l3bwsq.webp",
        name: "We're in the Big Leagues Now / Baseball Player",
        tags: [
            "success", "challenge", "professional", "sports", "baseball",
            "stepping-up", "achievement", "ambition", "next-level", "major-league"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "3",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918522/third_iuzceg.webp",
        name: "Two Hands Shaking Over an Object (Deal)",
        tags: [
            "deal", "agreement", "compromise", "transaction", "sharing",
            "partnership", "business", "negotiation", "mutual-benefit", "contract"
        ],
        textRegions: [
            { name: "Object Label", x: 30, y: 5, width: 40, height: 10 }
        ],
        requireAdvancedEditor: false
    },
    {
        templateId: "6",
        imageUrl: "https://res.cloudinary.com/dd61ssfwh/image/upload/v1764918521/sixth_ycbuya.webp",
        name: "Man with Mouth Open in Shock / Oh My God",
        tags: [
            "shock", "surprise", "amazement", "reaction", "open-mouth",
            "unbelievable", "realization", "seeing-the-results", "gasp", "wtf"
        ],
        textRegions: [
            { name: "Top Caption", x: 5, y: 5, width: 90, height: 20 }
        ],
        requireAdvancedEditor: false
    },
];