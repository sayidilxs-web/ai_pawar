/**
 * NEXUS AI - Literature & History Knowledge
 */

class LiteratureKnowledge {
    constructor() {
        this.data = {
            // ===== বাংলা সাহিত্য =====
            bangla_literature: {
                poets: {
                    "রবীন্দ্রনাথ ঠাকুর": {
                        full_name: "রবীন্দ্রনাথ ঠাকুর",
                        born: "1861",
                        died: "1941",
                        achievements: ["নোবেল পুরস্কার ১৯১৩ (গীতাঞ্জলি)", "সাহিত্যে অবদান অসীম"],
                        works: {
                            poetry: ["গীতাঞ্জলি", "গীতালি", "সোনার তরী", "বলাকা", "পুনশ্চ", "খেয়া"],
                            novels: ["গোরা", "ঘরে বাইরে", "চতুরঙ্গ", "যমুনাবতী", "শেষের কবিতা"],
                            short_stories: ["কাবুলিওয়ালা", "পোস্টমাস্টার", "হত্যা", "সূর্যদ্বার", "নিষ্কৃতি"],
                            plays: ["রাজা ও রাজি", "ডাকঘর", "অচলায়তন", "রক্তকরবী"]
                        },
                        famous_lines: [
                            "ওরে ওই অশান্ত দোষী, ওরে ওই পাপী তুমি বড় বিপদে পড়েছ",
                            "আমি চিরদিন তোমার দাসী, এই জীবন তোমার দান",
                            "যখন পড়বে না জয়গান, তখন আমার বিজয় হবে"
                        ]
                    },
                    "কাজী নজরুল ইসলাম": {
                        full_name: "কাজী নজরুল ইসলাম",
                        born: "1899",
                        died: "1976",
                        nickname: "বিদ্রোহী কবি",
                        works: {
                            poetry: ["বিষের বাঁশি", "ভাঙ্গার গান", "অগ্নিবীণা", "দুর্দিনের দিনে", "প্রেমের পালা"],
                            songs: ["আমার সোনার বাংলা", "এই দেশে শান্তি নাই", "মোরা এখন ঐ জিজ্ঞাসা"],
                            stories: ["পদ্মা নদীর বিদ্রোহ", "মুক্তি"]
                        },
                        famous_lines: [
                            "আমারে আমারে ডাক দেয়েছে বন্দীর তরে আমি যে চিরবন্দী",
                            "হাজার বছর ধরে আমি পৃথিবীতে কাজ করেছি জেগে"
                        ]
                    },
                    "বঙ্কিমচন্দ্র চট্টোপাধ্যায়": {
                        full_name: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
                        born: "1838",
                        died: "1894",
                        title: "আধুনিক বাংলা উপন্যাসের জনক",
                        works: {
                            novels: ["কপালকুণ্ডলা", "মৃণালিনী", "বিষবৃক্ষ", "চন্দ্রনাথ", "রাধারাণী", "দুর্গেশনন্দিনী"],
                            essays: ["বঙ্গদর্শন", "কমলাকান্তের দপ্তর"]
                        }
                    },
                    "শরৎচন্দ্র চট্টোপাধ্যায়": {
                        full_name: "শরৎচন্দ্র চট্টোপাধ্যায়",
                        born: "1878",
                        died: "1938",
                        works: {
                            novels: ["পথের দাবী", "গৃহদাহ", "শেষ প্রশ্ন", "পরিণীতা", "চন্দ্রনাথ", "দেবদাস"],
                            short_stories: ["স্ত্রীর পত্র", "পতিত", "মন্দির"]
                        }
                    },
                    "হুমায়ূন আহমেদ": {
                        full_name: "হুমায়ূন আহমেদ",
                        born: "1948",
                        died: "2012",
                        profession: ["লেখক", "চিত্রনাট্যকার", "নাট্য পরিচালক"],
                        works: {
                            novels: ["বহুব্রীহি", "দেবী", "অয়ি ও আমি", "সায়েন্স ফিকশন", "নন্দিত মরুদ্যান", "আমার এই তন্দ্রা"],
                            dramas: ["গাঙ্কার", "এই সব ভুলো মন", "মাতা"],
                            stories: ["একজন কর্মচারীর পত্র", "ঘাটে এসো মা"]
                        }
                    },
                    "মাইকেল মধুসূদন দত্ত": {
                        full_name: "মাইকেল মধুসূদন দত্ত",
                        born: "1824",
                        died: "1873",
                        title: "অমিত্রাক্ষর ছন্দের জনক",
                        works: {
                            poetry: ["মেঘনাদবধ কাব্য", "পদ্মাবতী"],
                            drama: ["কৃষ্ণকুমারী", "শর্মিষ্ঠা"]
                        }
                    }
                },
                famous_books: {
                    ancient: ["চর্যাপদ (১০ম-১২শ শতক)"],
                    medieval: ["শ্রীকৃষ্ণকীর্তন", "অন্নদামঙ্গল"],
                    modern: ["কপালকুণ্ডলা (১৮৬৬) - প্রথম বাংলা উপন্যাস", "গীতাঞ্জলি (১৯১০) - নোবেল পুরস্কার"]
                }
            },
            
            // ===== বিশ্ব সাহিত্য =====
            world_literature: {
                greek: {
                    homer: {
                        works: ["Iliad (ইলিয়ড)", "Odyssey (ওডিসি)"]
                    },
                    sophocles: {
                        works: ["Oedipus Rex", "Antigone"]
                    },
                    plato: {
                        works: ["Republic (রিপাবলিক)", "Symposium"]
                    },
                    aristotle: {
                        works: ["Poetics (কাব্য শাস্ত্র)", "Politics"]
                    }
                },
                english: {
                    shakespeare: {
                        name: "William Shakespeare",
                        born: "1564",
                        died: "1616",
                        title: "All the world's a stage",
                        tragedies: ["Hamlet", "Macbeth", "Othello", "King Lear", "Romeo and Juliet"],
                        comedies: ["A Midsummer Night's Dream", "Twelfth Night", "Much Ado About Nothing"],
                        histories: ["Henry V", "Richard III"]
                    },
                    dickens: {
                        works: ["Oliver Twist", "A Tale of Two Cities", "Great Expectations", "David Copperfield"]
                    },
                    austen: {
                        works: ["Pride and Prejudice", "Sense and Sensibility", "Emma"]
                    },
                    orwell: {
                        works: ["1984", "Animal Farm"]
                    },
                    tolkien: {
                        works: ["The Lord of the Rings", "The Hobbit"]
                    }
                },
                russian: {
                    tolstoy: {
                        works: ["War and Peace", "Anna Karenina"]
                    },
                    dostoevsky: {
                        works: ["Crime and Punishment", "The Brothers Karamazov", "Notes from Underground"]
                    },
                    chekhov: {
                        works: ["The Seagull", "Uncle Vanya", "Three Sisters"]
                    }
                },
                american: {
                    hemingway: {
                        works: ["The Old Man and the Sea", "A Farewell to Arms", "For Whom the Bell Tolls"]
                    },
                    fitzgerald: {
                        works: ["The Great Gatsby"]
                    },
                    twain: {
                        works: ["The Adventures of Tom Sawyer", "Adventures of Huckleberry Finn"]
                    }
                },
                german: {
                    goethe: {
                        works: ["Faust", "The Sorrows of Young Werther"]
                    },
                    kafka: {
                        works: ["The Metamorphosis", "The Trial", "The Castle"]
                    },
                    nietzsche: {
                        works: ["Thus Spoke Zarathustra", "Beyond Good and Evil"]
                    }
                }
            },
            
            // ===== পৃথিবীর ইতিহাস =====
            world_history: {
                ancient_civilizations: {
                    mesopotamia: {
                        period: "3500 BCE - 539 BCE",
                        location: "আজকের ইরাক",
                        achievements: ["লেখার আবিষ্কার (Cuneiform)", "হুইল", "কৃষি ব্যবস্থা", "Code of Hammurabi"]
                    },
                    egypt: {
                        period: "3100 BCE - 30 BCE",
                        achievements: ["পিরামিড", "হায়ারোগ্লিফ", "ফারাও সভ্যতা", "মমি"]
                    },
                    indus_valley: {
                        period: "3300 BCE - 1300 BCE",
                        location: "আজকের পাকিস্তান/ভারত",
                        achievements: ["শহর পরিকল্পনা", "ধর্ম", "বাণিজ্য"]
                    },
                    china: {
                        period: "1600 BCE onwards",
                        achievements: ["চীনা লেখা", "রেশম", "কাগজ", "কম্পাস"]
                    },
                    greece: {
                        period: "800 BCE - 31 BCE",
                        achievements: ["গণতন্ত্র", "অলিম্পিক", "দর্শন", "স্থাপত্য"]
                    },
                    rome: {
                        period: "753 BCE - 476 CE",
                        achievements: ["পাথরের রাস্তা", "আইন", "সেনাবাহিনী", "জল সরবরাহ"]
                    }
                },
                middle_ages: {
                    byzantine: "Eastern Roman Empire, 330-1453 CE",
                    islamic_golden_age: "750-1258 CE, Baghdad House of Wisdom",
                    medieval_europe: "Feudal system, Crusades",
                    mongol_empire: "1206-1368 CE, Genghis Khan"
                },
                modern_history: {
                    renaissance: "14th-17th century, Europe",
                    enlightenment: "17th-19th century",
                    industrial_revolution: "1760-1840, Britain",
                    world_war_1: "1914-1918",
                    world_war_2: "1939-1945",
                    cold_war: "1947-1991"
                },
                famous_events: {
                    french_revolution: "1789",
                    american_revolution: "1775-1783",
                    russian_revolution: "1917",
                    chinese_revolution: "1949",
                    moon_landing: "1969"
                }
            },
            
            // ===== বাংলার ইতিহাস =====
            bangladesh_history: {
                ancient: {
                    bangladesh: "প্রাচীন গাঙ্গেয় সভ্যতা",
                    vanga: "বঙ্গ দেশের প্রাচীন নাম"
                },
                sultanate: {
                    period: "1204-1576",
                    capital: "গৌড়"
                },
                mughal: {
                    period: "1576-1757",
                    important: "সুবেদার, নবাব"
                },
                british_rule: {
                    period: "1757-1947",
                    battles: ["পলাশীর যুদ্ধ ১৭৫৭", "ময়মনসিংহের যুদ্ধ", "ত্রিপুরার যুদ্ধ"]
                },
                language_movement: {
                    year: "1948-1952",
                    significance: "মাতৃভাষার অধিকার প্রতিষ্ঠা",
                    martyr: "ভাষা শহীদদের স্মরণ"
                },
                liberation_war: {
                    year: "1971",
                    independence: "২৬ মার্চ",
                    victory: "১৬ ডিসেম্বর",
                    leader: "বঙ্গবন্ধু শেখ মুজিবুর রহমান",
                    genocide: "মুক্তিযুদ্ধকালীন গণহত্যা"
                }
            }
        };
    }
    
    search(query) {
        return this.findInData(this.data, query.toLowerCase());
    }
    
    findInData(obj, query, results = []) {
        if (typeof obj === 'string') {
            if (obj.toLowerCase().includes(query)) {
                results.push(obj);
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                this.findInData(obj[key], query, results);
            }
        }
        return results;
    }
}

window.LiteratureKnowledge = LiteratureKnowledge;
