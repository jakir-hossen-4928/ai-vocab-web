export interface ListeningQuestion {
    id: number;
    number: number;
    beforeInput: string;
    afterInput: string;
    answer: string;
}

export interface ListeningSection {
    title: string;
    instruction: string;
    questions: ListeningQuestion[];
}

export interface ListeningTest {
    id: string;
    title: string;
    audioUrl: string;
    sections: ListeningSection[];
}

export const listeningTests: ListeningTest[] = [
    {
        "id": "test-1",
        "title": "Listening Test 1",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-6",
                "questions": [
                    {
                        "id": 101,
                        "number": 1,
                        "beforeInput": "PRESTON PARK RUN Details of run Day of Park Run:       Saturday Start of run:  in front of the",
                        "afterInput": "",
                        "answer": "café"
                    },
                    {
                        "id": 102,
                        "number": 2,
                        "beforeInput": "Time of start:",
                        "afterInput": "",
                        "answer": "9/nine am /9/nine o'clock"
                    },
                    {
                        "id": 103,
                        "number": 3,
                        "beforeInput": "Length of run:",
                        "afterInput": "",
                        "answer": "5/five km/kilometers/kilometers"
                    },
                    {
                        "id": 104,
                        "number": 4,
                        "beforeInput": "At end of run:  volunteer scans",
                        "afterInput": "",
                        "answer": "(a) bar(-)code / (a) barcode/bar code"
                    },
                    {
                        "id": 105,
                        "number": 5,
                        "beforeInput": "Best way to register: on the",
                        "afterInput": "",
                        "answer": "website/web site"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 7-10",
                "questions": [
                    {
                        "id": 107,
                        "number": 7,
                        "beforeInput": "Volunteering Contact name: Pete",
                        "afterInput": "",
                        "answer": "M–A–U–G–H–A–N"
                    },
                    {
                        "id": 108,
                        "number": 8,
                        "beforeInput": "Phone number:",
                        "afterInput": "",
                        "answer": "01444 732900"
                    },
                    {
                        "id": 109,
                        "number": 9,
                        "beforeInput": "Activities: setting up course",
                        "afterInput": "the runners",
                        "answer": "guiding/guide"
                    },
                    {
                        "id": 110,
                        "number": 10,
                        "beforeInput": "",
                        "afterInput": "for the weekly report",
                        "answer": "taking/take photos/ photographs"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-2",
        "title": "Listening Test 2",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-6",
                "questions": [
                    {
                        "id": 201,
                        "number": 1,
                        "beforeInput": "Short Story Competition  Entry Details Example Cost of entry:                  £5 Length of story:  approximately",
                        "afterInput": "",
                        "answer": "3000/3,000/three thousand words"
                    },
                    {
                        "id": 202,
                        "number": 2,
                        "beforeInput": "Story must include: a",
                        "afterInput": "",
                        "answer": "surprise/surprising ending"
                    },
                    {
                        "id": 203,
                        "number": 3,
                        "beforeInput": "Minimum age:",
                        "afterInput": "",
                        "answer": "16/sixteen"
                    },
                    {
                        "id": 204,
                        "number": 4,
                        "beforeInput": "Last entry date:  1st",
                        "afterInput": "",
                        "answer": "August"
                    },
                    {
                        "id": 205,
                        "number": 5,
                        "beforeInput": "Web address:  www.",
                        "afterInput": ".com",
                        "answer": "COMP4SS/comp4ss"
                    },
                    {
                        "id": 206,
                        "number": 6,
                        "beforeInput": "Don’t:",
                        "afterInput": "the story to the organisers",
                        "answer": "post"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 7-10",
                "questions": [
                    {
                        "id": 207,
                        "number": 7,
                        "beforeInput": "Judging and Prize Details The competition is judged by",
                        "afterInput": ".",
                        "answer": "famous authors"
                    },
                    {
                        "id": 208,
                        "number": 8,
                        "beforeInput": "The top five stories will be available",
                        "afterInput": ".",
                        "answer": "online"
                    },
                    {
                        "id": 209,
                        "number": 9,
                        "beforeInput": "The top story will be chosen by the",
                        "afterInput": ".",
                        "answer": "public"
                    },
                    {
                        "id": 210,
                        "number": 10,
                        "beforeInput": "The first prize is a place at a writers' workshop in",
                        "afterInput": ".",
                        "answer": "Spain"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-3",
        "title": "Listening Test 3",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-5",
                "questions": [
                    {
                        "id": 301,
                        "number": 1,
                        "beforeInput": "Complete the form below.  SARAH'S HEALTH & FITNESS CLUB  MEMBERSHIP FORM First name:               Harry Last name:",
                        "afterInput": "",
                        "answer": "S-Y-M-O-N-D-S/S-y-m-o-n-d-s"
                    },
                    {
                        "id": 302,
                        "number": 2,
                        "beforeInput": "Date of Birth:  Day: 11th; Month: December; Year:",
                        "afterInput": "",
                        "answer": "1996"
                    },
                    {
                        "id": 303,
                        "number": 3,
                        "beforeInput": "Type of Membership:",
                        "afterInput": "",
                        "answer": "full(-)time"
                    },
                    {
                        "id": 304,
                        "number": 4,
                        "beforeInput": "Activities:  Badminton and",
                        "afterInput": "",
                        "answer": "swimming"
                    },
                    {
                        "id": 305,
                        "number": 5,
                        "beforeInput": "Payment details:  Total: £450 To be paid",
                        "afterInput": "",
                        "answer": "monthly"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 6-10",
                "questions": [
                    {
                        "id": 306,
                        "number": 6,
                        "beforeInput": "Lifestyle questionnaire What exercise do you do regularly?",
                        "afterInput": "",
                        "answer": "(go/do) jogging"
                    },
                    {
                        "id": 307,
                        "number": 7,
                        "beforeInput": "Do you have any injuries?                       has a",
                        "afterInput": "",
                        "answer": "bad ankle"
                    },
                    {
                        "id": 308,
                        "number": 8,
                        "beforeInput": "What is your goal or target?                       a better",
                        "afterInput": "",
                        "answer": "fitness level"
                    },
                    {
                        "id": 309,
                        "number": 9,
                        "beforeInput": "What is your occupation?     a",
                        "afterInput": "",
                        "answer": "charity worker"
                    },
                    {
                        "id": 310,
                        "number": 10,
                        "beforeInput": "How did you hear about the club?",
                        "afterInput": "",
                        "answer": "(on) (the) radio"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-4",
        "title": "Listening Test 4",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-6",
                "questions": [
                    {
                        "id": 401,
                        "number": 1,
                        "beforeInput": "Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer.  Community Centre Evening Classes Class Where When What to bring Cost Painting with watercolours in the hall at",
                        "afterInput": "",
                        "answer": "7.30/seven thirty"
                    },
                    {
                        "id": 402,
                        "number": 2,
                        "beforeInput": "pm on Tuesdays water jar and set of",
                        "afterInput": "",
                        "answer": "pencils"
                    },
                    {
                        "id": 403,
                        "number": 3,
                        "beforeInput": "£45 – four classes Maori language the small room at the",
                        "afterInput": "",
                        "answer": "top"
                    },
                    {
                        "id": 404,
                        "number": 4,
                        "beforeInput": "of the building starts in",
                        "afterInput": "small recorder",
                        "answer": "August"
                    },
                    {
                        "id": 405,
                        "number": 5,
                        "beforeInput": "£40 – five classes  Digital photography room 9 6 pm Wednesday evenings the",
                        "afterInput": "",
                        "answer": "instructions"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-5",
        "title": "Listening Test 5",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 501,
                        "number": 1,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER  for each answer.  City Transport Lost Property Enquiry Main item lost:     suitcase Description of main item:  black with thin",
                        "afterInput": "stripes",
                        "answer": "white"
                    },
                    {
                        "id": 502,
                        "number": 2,
                        "beforeInput": "Other items:  a set of",
                        "afterInput": "keys",
                        "answer": "office"
                    },
                    {
                        "id": 503,
                        "number": 3,
                        "beforeInput": "some documents a",
                        "afterInput": "in a box",
                        "answer": "camera"
                    },
                    {
                        "id": 504,
                        "number": 4,
                        "beforeInput": "a blue",
                        "afterInput": "",
                        "answer": "umbrella"
                    },
                    {
                        "id": 505,
                        "number": 5,
                        "beforeInput": "Journey details Date and time:         2.00 -2.30 pm on",
                        "afterInput": "",
                        "answer": "13th May/13 May/ thirteenth May /"
                    },
                    {
                        "id": 506,
                        "number": 6,
                        "beforeInput": "Basic route:      caller travelled from the",
                        "afterInput": "to Highbury",
                        "answer": "airport"
                    },
                    {
                        "id": 507,
                        "number": 7,
                        "beforeInput": "Mode of travel:      caller thinks she left the suitcase in a",
                        "afterInput": "",
                        "answer": "taxi"
                    },
                    {
                        "id": 508,
                        "number": 8,
                        "beforeInput": "Personal details  Name:                          Lisa",
                        "afterInput": "",
                        "answer": "Docherty"
                    },
                    {
                        "id": 509,
                        "number": 9,
                        "beforeInput": "Address:                  15A",
                        "afterInput": "Rd, Highbury",
                        "answer": "River"
                    },
                    {
                        "id": 510,
                        "number": 10,
                        "beforeInput": "Phone number:",
                        "afterInput": "",
                        "answer": "07979605437"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-6",
        "title": "Listening Test 6",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 603,
                        "number": 3,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER  for each answer.  ACCOMMODATION FORM: RENTAL PROPERTIES  Name:  Jane  Ryder Contact phone number:  1 (0044) ................................. Email address:  2 richard@ ....................... .co.uk Occupation:  a local",
                        "afterInput": "",
                        "answer": "doctor"
                    },
                    {
                        "id": 604,
                        "number": 4,
                        "beforeInput": "Type of accommodation:  a 2-bedroom apartment wanted (must have its own",
                        "afterInput": ")",
                        "answer": "garage"
                    },
                    {
                        "id": 605,
                        "number": 5,
                        "beforeInput": "no",
                        "afterInput": "required (family bringing theirs)",
                        "answer": "furniture"
                    },
                    {
                        "id": 606,
                        "number": 6,
                        "beforeInput": "a",
                        "afterInput": "in the kitchen is preferable",
                        "answer": "fridge"
                    },
                    {
                        "id": 607,
                        "number": 7,
                        "beforeInput": "Preferred location:  near a",
                        "afterInput": "",
                        "answer": "school"
                    },
                    {
                        "id": 608,
                        "number": 8,
                        "beforeInput": "Maximum rent:",
                        "afterInput": "per month",
                        "answer": "950/£950"
                    },
                    {
                        "id": 609,
                        "number": 9,
                        "beforeInput": "Other requests:  the accommodation has to be",
                        "afterInput": "in",
                        "answer": "quiet"
                    },
                    {
                        "id": 610,
                        "number": 10,
                        "beforeInput": "the daytime How did you first hear about us?  through a",
                        "afterInput": "",
                        "answer": "friend"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-7",
        "title": "Listening Test 7",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-6",
                "questions": [
                    {
                        "id": 701,
                        "number": 1,
                        "beforeInput": "Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. Hostel accommodation in Darwin Name  Price per person (dormitory rooms) Comments and reviews  Top  End Backpackers $19  • parking available - staff are",
                        "afterInput": "",
                        "answer": "unfriendly"
                    },
                    {
                        "id": 702,
                        "number": 2,
                        "beforeInput": "- nice pool - air-conditioning is too",
                        "afterInput": "",
                        "answer": "noisy"
                    },
                    {
                        "id": 704,
                        "number": 4,
                        "beforeInput": "Gum Tree Lodge 3 $ ..................... - good quiet location - pool and gardens -",
                        "afterInput": "in the dormitories",
                        "answer": "insects"
                    },
                    {
                        "id": 705,
                        "number": 5,
                        "beforeInput": "Kangaroo Lodge  $22  • downtown location - reception at the lodge is always open - no lockers in the rooms - the",
                        "afterInput": "are very clean",
                        "answer": "bathrooms"
                    },
                    {
                        "id": 706,
                        "number": 6,
                        "beforeInput": "- seems to be a",
                        "afterInput": "every",
                        "answer": "party"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 7-10",
                "questions": [
                    {
                        "id": 707,
                        "number": 7,
                        "beforeInput": "Kangaroo Lodge Address: on",
                        "afterInput": "Lane",
                        "answer": "S-H-A-D-F-O-R-T-H/S-h-a-d-f-o-r-t-h"
                    },
                    {
                        "id": 708,
                        "number": 8,
                        "beforeInput": "General information about hostel accommodation - sheets are provided - can hire a",
                        "afterInput": "",
                        "answer": "towel"
                    },
                    {
                        "id": 709,
                        "number": 9,
                        "beforeInput": "-",
                        "afterInput": "is included",
                        "answer": "breakfast"
                    },
                    {
                        "id": 710,
                        "number": 10,
                        "beforeInput": "- a shared",
                        "afterInput": "is available",
                        "answer": "kitchen"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-8",
        "title": "Listening Test 8",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 801,
                        "number": 1,
                        "beforeInput": "Hilary Lodge Retirement Home The name of the  manager  is Cathy Activities programme involving volunteers Monday evenings: computer training - Training needed in how to produce",
                        "afterInput": "",
                        "answer": "(simple) documents"
                    },
                    {
                        "id": 802,
                        "number": 2,
                        "beforeInput": "Tuesday afternoons: singing - The home has a",
                        "afterInput": "and someone to play it",
                        "answer": "keyboard"
                    },
                    {
                        "id": 803,
                        "number": 3,
                        "beforeInput": "Thursday mornings: growing",
                        "afterInput": "",
                        "answer": "flowers"
                    },
                    {
                        "id": 804,
                        "number": 4,
                        "beforeInput": "- The home doesn’t have many",
                        "afterInput": "for gardening",
                        "answer": "tools"
                    },
                    {
                        "id": 805,
                        "number": 5,
                        "beforeInput": "Once a month: meeting for volunteers and staff  Interview - Go in on",
                        "afterInput": ", any time",
                        "answer": "Saturday"
                    },
                    {
                        "id": 806,
                        "number": 6,
                        "beforeInput": "- Interview with assistant called",
                        "afterInput": "",
                        "answer": "Mairead"
                    },
                    {
                        "id": 807,
                        "number": 7,
                        "beforeInput": "- Address of home: 73",
                        "afterInput": "Road",
                        "answer": "Bridge"
                    },
                    {
                        "id": 808,
                        "number": 8,
                        "beforeInput": "'Open house' days - Agreed to help on",
                        "afterInput": "",
                        "answer": "(the) 14(th)/fourteen(th) (of) May /"
                    },
                    {
                        "id": 809,
                        "number": 9,
                        "beforeInput": "- Will show visitors where to",
                        "afterInput": "",
                        "answer": "park"
                    },
                    {
                        "id": 810,
                        "number": 10,
                        "beforeInput": "- Possibility of talking to a",
                        "afterInput": "reporter",
                        "answer": "newspaper"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-9",
        "title": "Listening Test 9",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-5",
                "questions": [
                    {
                        "id": 901,
                        "number": 1,
                        "beforeInput": "Transport from Airport to Milton Distance:                                       147 miles  Options: - Car hire - don’t want to drive  •",
                        "afterInput": "",
                        "answer": "(a) taxi/cab"
                    },
                    {
                        "id": 902,
                        "number": 2,
                        "beforeInput": "- expensive - Greyhound bus - $15 single, $27.50 return - direct to the",
                        "afterInput": "",
                        "answer": "city centre/center"
                    },
                    {
                        "id": 903,
                        "number": 3,
                        "beforeInput": "- long",
                        "afterInput": "",
                        "answer": "wait"
                    },
                    {
                        "id": 904,
                        "number": 4,
                        "beforeInput": "• Airport Shuttle -",
                        "afterInput": "service",
                        "answer": "door-to-door"
                    },
                    {
                        "id": 905,
                        "number": 5,
                        "beforeInput": "- every 2 hours - $35 single, $65 return - need to",
                        "afterInput": "",
                        "answer": "reserve (a seat)"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 6-10",
                "questions": [
                    {
                        "id": 906,
                        "number": 6,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer.  AIRPORT SHUTTLE BOOKING FORM  TO:  Milton  Date:",
                        "afterInput": "",
                        "answer": "(the) 17th (of) October"
                    },
                    {
                        "id": 907,
                        "number": 7,
                        "beforeInput": "No. of passengers:   One  Bus Time:",
                        "afterInput": "pm",
                        "answer": "12.30"
                    },
                    {
                        "id": 908,
                        "number": 8,
                        "beforeInput": "Type of ticket:   Single  Name:  Janet",
                        "afterInput": "",
                        "answer": "Thomson"
                    },
                    {
                        "id": 909,
                        "number": 9,
                        "beforeInput": "Flight No:",
                        "afterInput": "",
                        "answer": "AC 936"
                    },
                    {
                        "id": 910,
                        "number": 10,
                        "beforeInput": "From: London Heathrow Address in Milton:  Vacation Motel,  24, Kitchener Street  Fare:  $35  Credit Card No: (Visa)",
                        "afterInput": "",
                        "answer": "3303 8450 2045 6837"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-10",
        "title": "Listening Test 10",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 1001,
                        "number": 1,
                        "beforeInput": "CAR INSURANCE  Name: Patrick Jones  Address:",
                        "afterInput": ", Greendale",
                        "answer": "27 Bank Road"
                    },
                    {
                        "id": 1002,
                        "number": 2,
                        "beforeInput": "Contact number:  730453  Occupation:",
                        "afterInput": "",
                        "answer": "(a) dentist"
                    },
                    {
                        "id": 1003,
                        "number": 3,
                        "beforeInput": "Size of car engine:  1200cc Type of car:  Manufacturer: Hewton  Model:",
                        "afterInput": "",
                        "answer": "Sable"
                    },
                    {
                        "id": 1004,
                        "number": 4,
                        "beforeInput": "Year: 1997 Previous insurance company:    Any insurance claims in the last five",
                        "afterInput": "years?",
                        "answer": "Northern Star"
                    },
                    {
                        "id": 1005,
                        "number": 5,
                        "beforeInput": "Yes  No If yes, give brief details: Car was",
                        "afterInput": "in 1999",
                        "answer": "stolen"
                    },
                    {
                        "id": 1006,
                        "number": 6,
                        "beforeInput": "Name(s) of other driver(s):  Simon",
                        "afterInput": "",
                        "answer": "Paynter"
                    },
                    {
                        "id": 1007,
                        "number": 7,
                        "beforeInput": "Relationship to main driver:",
                        "afterInput": "",
                        "answer": "brother-in-law"
                    },
                    {
                        "id": 1008,
                        "number": 8,
                        "beforeInput": "Start date: 31 January Uses of car:    -  social  -",
                        "afterInput": "",
                        "answer": "(travel (ling/ing)) (to) work"
                    },
                    {
                        "id": 1009,
                        "number": 9,
                        "beforeInput": "Recommended Insurance arrangement Name of company:",
                        "afterInput": "",
                        "answer": "Red Flag"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-11",
        "title": "Listening Test 11",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Student is studying 1 .....................................",
                "instruction": "Questions -time",
                "questions": [
                    {
                        "id": 1102,
                        "number": 2,
                        "beforeInput": "Student is in the",
                        "afterInput": "year of the course.",
                        "answer": "third"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 3-5",
                "questions": [
                    {
                        "id": 1103,
                        "number": 3,
                        "beforeInput": "Position Available  Where  Problem Receptionist    in the",
                        "afterInput": "evening lectures",
                        "answer": "Sport(s) Centre"
                    },
                    {
                        "id": 1104,
                        "number": 4,
                        "beforeInput": "",
                        "afterInput": "in the Child Care Centre  too early",
                        "answer": "(a) cleaner"
                    },
                    {
                        "id": 1105,
                        "number": 5,
                        "beforeInput": "Clerical Assistant  in the",
                        "afterInput": "evening lectures",
                        "answer": "Library"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 6-10",
                "questions": [
                    {
                        "id": 1106,
                        "number": 6,
                        "beforeInput": "Complete the form below.  STUDENT DETAILS  Name:  Anita Newman  Address:",
                        "afterInput": "",
                        "answer": "International House"
                    },
                    {
                        "id": 1107,
                        "number": 7,
                        "beforeInput": "Room No.",
                        "afterInput": "",
                        "answer": "B659"
                    },
                    {
                        "id": 1108,
                        "number": 8,
                        "beforeInput": "Other skills:  Speaks some Japanese Position available:",
                        "afterInput": "at the",
                        "answer": "(an) office assistant"
                    },
                    {
                        "id": 1109,
                        "number": 9,
                        "beforeInput": "English Language Centre Duties:  Respond to enquiries and",
                        "afterInput": "",
                        "answer": "answer (the) phone"
                    },
                    {
                        "id": 1110,
                        "number": 10,
                        "beforeInput": "Time of interview:  Friday at",
                        "afterInput": "a.m.",
                        "answer": "11.30"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-12",
        "title": "Listening Test 12",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-6",
                "questions": [
                    {
                        "id": 1201,
                        "number": 1,
                        "beforeInput": "Complete the form below.  HOMESTAY APPLICATION First name:",
                        "afterInput": "",
                        "answer": "Keiko"
                    },
                    {
                        "id": 1202,
                        "number": 2,
                        "beforeInput": "Sex:                                               Female                               Nationality: Japanese Passport number:",
                        "afterInput": "Age:   28 years",
                        "answer": "JO6337"
                    },
                    {
                        "id": 1203,
                        "number": 3,
                        "beforeInput": "Present address:                          Room 21C, Willow College Length of homestay:                   Approx",
                        "afterInput": "",
                        "answer": "4 months"
                    },
                    {
                        "id": 1204,
                        "number": 4,
                        "beforeInput": "Course enrolled in:",
                        "afterInput": "",
                        "answer": "(Advanced) English (Studies)"
                    },
                    {
                        "id": 1205,
                        "number": 5,
                        "beforeInput": "Family preferences:                 no",
                        "afterInput": "",
                        "answer": "(young) children"
                    },
                    {
                        "id": 1206,
                        "number": 6,
                        "beforeInput": "no objection to",
                        "afterInput": "",
                        "answer": "pets"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-13",
        "title": "Listening Test 13",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 3-8",
                "questions": [
                    {
                        "id": 1303,
                        "number": 3,
                        "beforeInput": "Complete the form below.  SUMMER MUSIC FESTIVAL  BOOKING FORM NAME:                                              George O'Neil ADDRESS:",
                        "afterInput": ", Westsea",
                        "answer": "48 North Avenue"
                    },
                    {
                        "id": 1304,
                        "number": 4,
                        "beforeInput": "POSTCODE:",
                        "afterInput": "",
                        "answer": "WS6 2YH"
                    },
                    {
                        "id": 1305,
                        "number": 5,
                        "beforeInput": "TELEPHONE:",
                        "afterInput": "",
                        "answer": "01674 553242"
                    },
                    {
                        "id": 1306,
                        "number": 6,
                        "beforeInput": "Date Event Price per ticket No. of tickets  5 June Instrumental group  – Guitarrini  £7.50  2  17 June Singer (price includes",
                        "afterInput": "in the garden)",
                        "answer": "(free) drink(s) / refreshment(s)"
                    },
                    {
                        "id": 1307,
                        "number": 7,
                        "beforeInput": "£6 2  22 June",
                        "afterInput": "",
                        "answer": "(the/a) pianist/piano player"
                    },
                    {
                        "id": 1309,
                        "number": 9,
                        "beforeInput": "(Anna Ventura)  £7.00 1  23 June Spanish Dance & Guitar Concert 8 £ ...............",
                        "afterInput": "",
                        "answer": "4"
                    },
                    {
                        "id": 1310,
                        "number": 10,
                        "beforeInput": "NB Children / Students / Senior Citizens have",
                        "afterInput": "discount on all tickets.",
                        "answer": "50%"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-14",
        "title": "Listening Test 14",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-3",
                "questions": [
                    {
                        "id": 1401,
                        "number": 1,
                        "beforeInput": "Complete the form below.  TOTAL INSURANCE INCIDENT REPORT  Name  Michael Alexander  Address  24 Manly Street,",
                        "afterInput": ", Sydney",
                        "answer": "Milperra"
                    },
                    {
                        "id": 1402,
                        "number": 2,
                        "beforeInput": "Shipping agent",
                        "afterInput": "",
                        "answer": "First Class Movers"
                    },
                    {
                        "id": 1403,
                        "number": 3,
                        "beforeInput": "Place of origin  China Date of arrival",
                        "afterInput": "",
                        "answer": "28 November"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 4-10",
                "questions": [
                    {
                        "id": 1404,
                        "number": 4,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer. Item  Damage  Cost to repair/replace  Television  The",
                        "afterInput": "",
                        "answer": "screen"
                    },
                    {
                        "id": 1405,
                        "number": 5,
                        "beforeInput": "needs to be replaced Not known  The",
                        "afterInput": "",
                        "answer": "bathroom"
                    },
                    {
                        "id": 1406,
                        "number": 6,
                        "beforeInput": "cabinet  The",
                        "afterInput": "",
                        "answer": "door"
                    },
                    {
                        "id": 1408,
                        "number": 8,
                        "beforeInput": "or the cabinet is damaged  7 $ ........................... Dining room table A",
                        "afterInput": "is",
                        "answer": "leg"
                    },
                    {
                        "id": 1409,
                        "number": 9,
                        "beforeInput": "split  $200 Set of China Six",
                        "afterInput": "were broken About 10 $ ............ in total",
                        "answer": "plates"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-15",
        "title": "Listening Test 15",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-3",
                "questions": [
                    {
                        "id": 1501,
                        "number": 1,
                        "beforeInput": "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.  Rented Properties  Customer's  Requirements  Name:  Steven Godfrey No. of bedrooms:                          four Preferred location:  in the",
                        "afterInput": "area of town",
                        "answer": "central"
                    },
                    {
                        "id": 1503,
                        "number": 3,
                        "beforeInput": "Maximum monthly rent:  2 £ ................................... Length of let required:",
                        "afterInput": "",
                        "answer": "2 year(s)"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 4-8",
                "questions": [
                    {
                        "id": 1504,
                        "number": 4,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer. Address  Rooms  Monthly rent  Problem  Oakington Avenue living/dining room, separate kitchen £550  no",
                        "afterInput": "",
                        "answer": "garage"
                    },
                    {
                        "id": 1505,
                        "number": 5,
                        "beforeInput": "Mead Street large living room and kitchen, bathroom and a cloakroom  £580 the",
                        "afterInput": "",
                        "answer": "garden"
                    },
                    {
                        "id": 1506,
                        "number": 6,
                        "beforeInput": "is too large  Hamilton Road living room, kitchen-diner, and a",
                        "afterInput": "",
                        "answer": "study"
                    },
                    {
                        "id": 1507,
                        "number": 7,
                        "beforeInput": "£550  too",
                        "afterInput": "",
                        "answer": "noisy"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-16",
        "title": "Listening Test 16",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 1601,
                        "number": 1,
                        "beforeInput": "Write NO MORE THAT TWO WORDS AND/OR NUMBER for each answer. West Bay Hotel – details of job - Newspaper advert for temporary staff - Vacancies for",
                        "afterInput": "",
                        "answer": "waiter(s)"
                    },
                    {
                        "id": 1602,
                        "number": 2,
                        "beforeInput": "- Two shifts - Can choose your",
                        "afterInput": "(must be the same each week)",
                        "answer": "day off"
                    },
                    {
                        "id": 1603,
                        "number": 3,
                        "beforeInput": "- Pay: £5.50 per hour, including a",
                        "afterInput": "",
                        "answer": "break"
                    },
                    {
                        "id": 1604,
                        "number": 4,
                        "beforeInput": "- A",
                        "afterInput": "is provided in the hotel",
                        "answer": "(free) meal"
                    },
                    {
                        "id": 1605,
                        "number": 5,
                        "beforeInput": "- Total weekly pay: £231 - Dress: a white shirt and",
                        "afterInput": "trousers (not supplied)",
                        "answer": "dark (coloured/colored)"
                    },
                    {
                        "id": 1606,
                        "number": 6,
                        "beforeInput": "a",
                        "afterInput": "(supplied)",
                        "answer": "jacket"
                    },
                    {
                        "id": 1607,
                        "number": 7,
                        "beforeInput": "- Starting date:",
                        "afterInput": "",
                        "answer": "28 June"
                    },
                    {
                        "id": 1608,
                        "number": 8,
                        "beforeInput": "- Call Jane",
                        "afterInput": "(Service Manager) before 9 ................",
                        "answer": "Urwin"
                    },
                    {
                        "id": 1609,
                        "number": 9,
                        "beforeInput": "9 ................",
                        "afterInput": "",
                        "answer": "12.00 (pm)/noon/mid-day"
                    },
                    {
                        "id": 1610,
                        "number": 10,
                        "beforeInput": "tomorrow (Tel: 832009) - She'll require a",
                        "afterInput": "",
                        "answer": "reference"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-17",
        "title": "Listening Test 17",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 1701,
                        "number": 1,
                        "beforeInput": "JOB ENQUIRY Work at:     a restaurant - Type of work:",
                        "afterInput": "",
                        "answer": "answer(ing) (the) phone"
                    },
                    {
                        "id": 1702,
                        "number": 2,
                        "beforeInput": "- Number of hours per week: 12 hours - Would need work permit - Work in the:",
                        "afterInput": "branch",
                        "answer": "Hillsdunne Road"
                    },
                    {
                        "id": 1703,
                        "number": 3,
                        "beforeInput": "- Nearest bus stop: next to",
                        "afterInput": "",
                        "answer": "library"
                    },
                    {
                        "id": 1705,
                        "number": 5,
                        "beforeInput": "- Pay: 4 £ .............................. an hour - Extra benefits: - a free dinner - extra pay when you work on",
                        "afterInput": "",
                        "answer": "national holidays"
                    },
                    {
                        "id": 1706,
                        "number": 6,
                        "beforeInput": "- transport home when you work",
                        "afterInput": "",
                        "answer": "after 11 (o’clock)"
                    },
                    {
                        "id": 1707,
                        "number": 7,
                        "beforeInput": "- Qualities required:  -",
                        "afterInput": "",
                        "answer": "clear voice"
                    },
                    {
                        "id": 1708,
                        "number": 8,
                        "beforeInput": "- ability to",
                        "afterInput": "",
                        "answer": "think quickly"
                    },
                    {
                        "id": 1709,
                        "number": 9,
                        "beforeInput": "- Interview arranged for: Thursday",
                        "afterInput": "at 6 p.m.",
                        "answer": "22 October"
                    },
                    {
                        "id": 1710,
                        "number": 10,
                        "beforeInput": "- Bring the names of two referees - Ask for: Samira",
                        "afterInput": "",
                        "answer": "Manuja"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-18",
        "title": "Listening Test 18",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-10",
                "questions": [
                    {
                        "id": 1801,
                        "number": 1,
                        "beforeInput": "Write ONE WORD AND/OR NUMBER for each answer.  Accommodation Form – Student Information Type of accommodation: hall   of residence  Name: Anu",
                        "afterInput": "",
                        "answer": "Bhatt"
                    },
                    {
                        "id": 1802,
                        "number": 2,
                        "beforeInput": "Date of birth:",
                        "afterInput": "",
                        "answer": "31 March"
                    },
                    {
                        "id": 1803,
                        "number": 3,
                        "beforeInput": "Country of origin: India Course of study:",
                        "afterInput": "",
                        "answer": "nursing"
                    },
                    {
                        "id": 1804,
                        "number": 4,
                        "beforeInput": "Number of years planned in hall:",
                        "afterInput": "",
                        "answer": "2"
                    },
                    {
                        "id": 1805,
                        "number": 5,
                        "beforeInput": "Preferred catering arrangement: half board Special dietary requirements: no",
                        "afterInput": "(red)",
                        "answer": "meat"
                    },
                    {
                        "id": 1806,
                        "number": 6,
                        "beforeInput": "Preferred room type: a single",
                        "afterInput": "",
                        "answer": "bedsit"
                    },
                    {
                        "id": 1807,
                        "number": 7,
                        "beforeInput": "Interests: the",
                        "afterInput": "",
                        "answer": "theatre/theater"
                    },
                    {
                        "id": 1808,
                        "number": 8,
                        "beforeInput": "badminton Priorities in choice of hall: to be with other students who are",
                        "afterInput": "",
                        "answer": "mature/older"
                    },
                    {
                        "id": 1809,
                        "number": 9,
                        "beforeInput": "to live outside the",
                        "afterInput": "",
                        "answer": "town"
                    },
                    {
                        "id": 1810,
                        "number": 10,
                        "beforeInput": "to have a",
                        "afterInput": "area for socialising",
                        "answer": "shared"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-19",
        "title": "Listening Test 19",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-5",
                "questions": [
                    {
                        "id": 1901,
                        "number": 1,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer.  Apartments  Facilities  Other Information  Cost  Rose Garden  Apartments Studio flat  Example entertainment programme: Greek dancing  £219  Blue Bay  Apartments Large salt-water swimming pool -Just",
                        "afterInput": "Metres",
                        "answer": "300"
                    },
                    {
                        "id": 1902,
                        "number": 2,
                        "beforeInput": "from beach - near shops  £275",
                        "afterInput": "",
                        "answer": "Sunshade"
                    },
                    {
                        "id": 1903,
                        "number": 3,
                        "beforeInput": "Apartments terrace  watersports  £490 The Grand  - Greek paintings  -",
                        "afterInput": "",
                        "answer": "balcony"
                    },
                    {
                        "id": 1904,
                        "number": 4,
                        "beforeInput": "- overlooking",
                        "afterInput": "",
                        "answer": "forest/forests"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 6-10",
                "questions": [
                    {
                        "id": 1907,
                        "number": 7,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer.  GREEK ISLAND HOLIDAYS  Insurance Benefits  Maximum Amount  Cancellation  6 £ ...................................  Hospital £600. Additional benefit allows a",
                        "afterInput": "to",
                        "answer": "relative"
                    },
                    {
                        "id": 1908,
                        "number": 8,
                        "beforeInput": "travel to resort",
                        "afterInput": "departure  Up to £1000. Depends on reason",
                        "answer": "missed"
                    },
                    {
                        "id": 1909,
                        "number": 9,
                        "beforeInput": "Personal belongings  Up to £3000; £500 for one",
                        "afterInput": "",
                        "answer": "item"
                    },
                    {
                        "id": 1910,
                        "number": 10,
                        "beforeInput": "Name of Assistant Manager: Ben",
                        "afterInput": "",
                        "answer": "Ludlow"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-20",
        "title": "Listening Test 20",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 1-4",
                "questions": [
                    {
                        "id": 2001,
                        "number": 1,
                        "beforeInput": "Health Centres Name of centre  Doctor's name  Advantage  The Harvey Clinic   Example  Dr Green especially good with",
                        "afterInput": "",
                        "answer": "babies"
                    },
                    {
                        "id": 2002,
                        "number": 2,
                        "beforeInput": "The",
                        "afterInput": "",
                        "answer": "Eshcol"
                    },
                    {
                        "id": 2003,
                        "number": 3,
                        "beforeInput": "Health Practice Dr Fuller  offers",
                        "afterInput": "appointments",
                        "answer": "evening"
                    },
                    {
                        "id": 2004,
                        "number": 4,
                        "beforeInput": "The Shore Lane Health  Centre  Dr",
                        "afterInput": "",
                        "answer": "Gormley"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 7-10",
                "questions": [
                    {
                        "id": 2007,
                        "number": 7,
                        "beforeInput": "Talks for patients at Shore Lane Health Centre Subject of talk  Date/Time  Location  Notes Giving up smoking  25 th February at 7 pm room 4  useful for people with asthma or",
                        "afterInput": "",
                        "answer": "heart"
                    },
                    {
                        "id": 2008,
                        "number": 8,
                        "beforeInput": "problems Healthy eating  1 st March at 5pm  the",
                        "afterInput": "",
                        "answer": "primary school"
                    },
                    {
                        "id": 2009,
                        "number": 9,
                        "beforeInput": "(Shore Lane) anyone welcome Avoiding injuries during exercise  9 th March at",
                        "afterInput": "",
                        "answer": "4.30"
                    },
                    {
                        "id": 2010,
                        "number": 10,
                        "beforeInput": "room 6  for all",
                        "afterInput": "",
                        "answer": "ages"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-21",
        "title": "Listening Test 21",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 11-14",
                "questions": [
                    {
                        "id": 2111,
                        "number": 11,
                        "beforeInput": "PACTON-ON-SEA BUS TOUR Bus stops  Location  Things to see Bus stop 1  train station  start of tour Bus stop 2  the aquarium  dolphins and",
                        "afterInput": "",
                        "answer": "sharks"
                    },
                    {
                        "id": 2112,
                        "number": 12,
                        "beforeInput": "Bus stop 3",
                        "afterInput": "yachts and power boats",
                        "answer": "old fishing village/Old Fishing Village"
                    },
                    {
                        "id": 2113,
                        "number": 13,
                        "beforeInput": "Bus stop 4",
                        "afterInput": "centre  very old 14 ......................",
                        "answer": "shopping"
                    },
                    {
                        "id": 2114,
                        "number": 14,
                        "beforeInput": "14 ......................",
                        "afterInput": "",
                        "answer": "(water) fountain"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-22",
        "title": "Listening Test 22",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 2201,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2202,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2203,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2204,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2205,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2206,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2207,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2208,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2209,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2210,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-23",
        "title": "Listening Test 23",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 18-20",
                "questions": [
                    {
                        "id": 2318,
                        "number": 18,
                        "beforeInput": "General instructions In order to get the guests to move to the restaurant the hotel manager will",
                        "afterInput": "",
                        "answer": "ring a bell"
                    },
                    {
                        "id": 2319,
                        "number": 19,
                        "beforeInput": "Seating plans will be placed on each table and also in the",
                        "afterInput": "",
                        "answer": "lounge"
                    },
                    {
                        "id": 2320,
                        "number": 20,
                        "beforeInput": "There will be a total of three",
                        "afterInput": "",
                        "answer": "speeches/speakers"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-24",
        "title": "Listening Test 24",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 2401,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2402,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2403,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2404,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2405,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2406,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2407,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2408,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2409,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2410,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-25",
        "title": "Listening Test 25",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 2501,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2502,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2503,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2504,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2505,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2506,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2507,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2508,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2509,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2510,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-26",
        "title": "Listening Test 26",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 11-15",
                "questions": [
                    {
                        "id": 2611,
                        "number": 11,
                        "beforeInput": "The police officer suggests neighbours give each other their",
                        "afterInput": ".",
                        "answer": "contact details"
                    },
                    {
                        "id": 2612,
                        "number": 12,
                        "beforeInput": "Neighbours should discuss what to do if there's any kind of",
                        "afterInput": ".",
                        "answer": "(an) emergency"
                    },
                    {
                        "id": 2613,
                        "number": 13,
                        "beforeInput": "It's a good idea to leave on the",
                        "afterInput": ".",
                        "answer": "radio"
                    },
                    {
                        "id": 2614,
                        "number": 14,
                        "beforeInput": "Think carefully about where you put any",
                        "afterInput": ".",
                        "answer": "(spare/extra) keys"
                    },
                    {
                        "id": 2615,
                        "number": 15,
                        "beforeInput": "It's a good idea to buy good-quality",
                        "afterInput": ".",
                        "answer": "(window) locks"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-27",
        "title": "Listening Test 27",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 2701,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2702,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2703,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2704,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2705,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2706,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2707,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2708,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2709,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2710,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-28",
        "title": "Listening Test 28",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 16-20",
                "questions": [
                    {
                        "id": 2816,
                        "number": 16,
                        "beforeInput": "New staff responsibilities Name  New responsibility Jenny Reed Buying",
                        "afterInput": "for the Centre",
                        "answer": "films/movies"
                    },
                    {
                        "id": 2817,
                        "number": 17,
                        "beforeInput": "Phil Penshurst Help with writing",
                        "afterInput": "for courses",
                        "answer": "reports"
                    },
                    {
                        "id": 2818,
                        "number": 18,
                        "beforeInput": "Tom Salisbury Information on topics related to the",
                        "afterInput": "",
                        "answer": "region"
                    },
                    {
                        "id": 2819,
                        "number": 19,
                        "beforeInput": "Saeed Aktar Finding a",
                        "afterInput": "",
                        "answer": "job"
                    },
                    {
                        "id": 2820,
                        "number": 20,
                        "beforeInput": "Shilpa Desai Help with",
                        "afterInput": "",
                        "answer": "housing"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-29",
        "title": "Listening Test 29",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 2901,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2902,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2903,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2904,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2905,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2906,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2907,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2908,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2909,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 2910,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-30",
        "title": "Listening Test 30",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 13-18",
                "questions": [
                    {
                        "id": 3013,
                        "number": 13,
                        "beforeInput": "Attraction  Further Information  STOP A:  Main Booking Office: First boat: 8 a.m. Last boat:",
                        "afterInput": "p.m.",
                        "answer": "6.30"
                    },
                    {
                        "id": 3014,
                        "number": 14,
                        "beforeInput": "Palace  • has lovely",
                        "afterInput": "",
                        "answer": "(formal) garden"
                    },
                    {
                        "id": 3015,
                        "number": 15,
                        "beforeInput": "STOP B:",
                        "afterInput": "",
                        "answer": "(Tower) Restaurant"
                    },
                    {
                        "id": 3016,
                        "number": 16,
                        "beforeInput": "- has good",
                        "afterInput": "",
                        "answer": "view(s)"
                    },
                    {
                        "id": 3017,
                        "number": 17,
                        "beforeInput": "of city centre STOP C:  Museum - bookshop specialising in the",
                        "afterInput": "of the local area",
                        "answer": "history"
                    },
                    {
                        "id": 3018,
                        "number": 18,
                        "beforeInput": "STOP D:  Entertainment Complex -",
                        "afterInput": "cinema",
                        "answer": "7 screen"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-31",
        "title": "Listening Test 31",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 17-20",
                "questions": [
                    {
                        "id": 3117,
                        "number": 17,
                        "beforeInput": "Complete the form below.  ITINERARY Day 1  arrive in Kishba Day 2  rest day Day 3  spend all day in a",
                        "afterInput": "",
                        "answer": "forest"
                    },
                    {
                        "id": 3118,
                        "number": 18,
                        "beforeInput": "Day 4  visit a school Day 5  rest day Day 6   see a",
                        "afterInput": "with old carvings",
                        "answer": "temple"
                    },
                    {
                        "id": 3119,
                        "number": 19,
                        "beforeInput": "Day 7  rest day Day 8  swim in a",
                        "afterInput": "",
                        "answer": "waterfall"
                    },
                    {
                        "id": 3120,
                        "number": 20,
                        "beforeInput": "Day 9  visit a",
                        "afterInput": "",
                        "answer": "village"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-32",
        "title": "Listening Test 32",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 18-20",
                "questions": [
                    {
                        "id": 3218,
                        "number": 18,
                        "beforeInput": "Nature Reserve  Area  Facility  Activity The Mangroves  boardwalk",
                        "afterInput": "",
                        "answer": "cycling"
                    },
                    {
                        "id": 3219,
                        "number": 19,
                        "beforeInput": "Frog Pond  outdoor classroom",
                        "afterInput": "",
                        "answer": "biology lesson"
                    },
                    {
                        "id": 3220,
                        "number": 20,
                        "beforeInput": "The Waterbird Refuge",
                        "afterInput": "bird watching",
                        "answer": "viewing shelter"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-33",
        "title": "Listening Test 33",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 3301,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3302,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3303,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3304,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3305,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3306,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3307,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3308,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3309,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3310,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-34",
        "title": "Listening Test 34",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 3401,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3402,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3403,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3404,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3405,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3406,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3407,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3408,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3409,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3410,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-35",
        "title": "Listening Test 35",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 11-16",
                "questions": [
                    {
                        "id": 3511,
                        "number": 11,
                        "beforeInput": "THE NATIONAL ARTS CENTRE Well known for:",
                        "afterInput": "",
                        "answer": "classical music / (classical/music)"
                    },
                    {
                        "id": 3512,
                        "number": 12,
                        "beforeInput": "Complex consists of:  concert rooms theatres cinemas art galleries public     library restaurants a",
                        "afterInput": "",
                        "answer": "bookshop/bookstore"
                    },
                    {
                        "id": 3513,
                        "number": 13,
                        "beforeInput": "Historical background:  1940 – area destroyed by bombs 1960s-1970s – Centre was",
                        "afterInput": "and built",
                        "answer": "planned"
                    },
                    {
                        "id": 3514,
                        "number": 14,
                        "beforeInput": "in",
                        "afterInput": "– opened to public",
                        "answer": "1983/(the) 1980s"
                    },
                    {
                        "id": 3515,
                        "number": 15,
                        "beforeInput": "Managed by:  the",
                        "afterInput": "",
                        "answer": "City Council"
                    },
                    {
                        "id": 3516,
                        "number": 16,
                        "beforeInput": "Open:",
                        "afterInput": "days per year",
                        "answer": "363"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-36",
        "title": "Listening Test 36",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 3601,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3602,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3603,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3604,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3605,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3606,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3607,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3608,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3609,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 3610,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-37",
        "title": "Listening Test 37",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 11-16",
                "questions": [
                    {
                        "id": 3711,
                        "number": 11,
                        "beforeInput": "Write ONE WORD AND/OR NUMBER for each answer.  SPORTS WORLD - a new",
                        "afterInput": "of an international sports goods",
                        "answer": "branch"
                    },
                    {
                        "id": 3712,
                        "number": 12,
                        "beforeInput": "company - located in the shopping centre to the",
                        "afterInput": "of Bradcaster",
                        "answer": "west"
                    },
                    {
                        "id": 3713,
                        "number": 13,
                        "beforeInput": "- has sports",
                        "afterInput": "and equipment on floors 1-3",
                        "answer": "clothing"
                    },
                    {
                        "id": 3714,
                        "number": 14,
                        "beforeInput": "- can get you any item within",
                        "afterInput": "days",
                        "answer": "10"
                    },
                    {
                        "id": 3715,
                        "number": 15,
                        "beforeInput": "- shop specializes in equipment for",
                        "afterInput": "",
                        "answer": "running"
                    },
                    {
                        "id": 3716,
                        "number": 16,
                        "beforeInput": "- has a special section which just sells",
                        "afterInput": "",
                        "answer": "bags"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-38",
        "title": "Listening Test 38",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 11-13",
                "questions": [
                    {
                        "id": 3811,
                        "number": 11,
                        "beforeInput": "Parks and open spaces Name of place  Of particular interest   Open Halland Common  source of River Ouse  24 hours  Holt Island many different",
                        "afterInput": "",
                        "answer": "trees"
                    },
                    {
                        "id": 3812,
                        "number": 12,
                        "beforeInput": "between",
                        "afterInput": "",
                        "answer": "Friday/Sunday"
                    },
                    {
                        "id": 3813,
                        "number": 13,
                        "beforeInput": "and ...........................  Longfield Country Park reconstruction of a 2,000- year-old",
                        "afterInput": "",
                        "answer": "farm"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-39",
        "title": "Listening Test 39",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "What is currently the main area of work of each of the following people?",
                "instruction": "Questions 14-18",
                "questions": [
                    {
                        "id": 3919,
                        "number": 19,
                        "beforeInput": "Choose FIVE answers from the box and write the correct letter, A-H, next to questions 14-18.  People 14 Simon (the speaker)  ..........................  15 Liz    ..........................  16 Sarah    ..........................  17 Duncan   ..........................  18 Judith    .......................... Questions 19 and 20 Write ONE WORD AND/OR A NUMBER for each answer. Feature  Size  Biggest challenge  Target age group Railway  1.2 Km  Making tunnels Go-Kart arena",
                        "afterInput": "m",
                        "answer": "120"
                    },
                    {
                        "id": 3920,
                        "number": 20,
                        "beforeInput": "2 Removing mounds on the track",
                        "afterInput": "",
                        "answer": "5 to 12"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-40",
        "title": "Listening Test 40",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Where can each of the following items be found?",
                "instruction": "Questions 14-18",
                "questions": [
                    {
                        "id": 4019,
                        "number": 19,
                        "beforeInput": "Choose FIVE answers from the box and write the correct letter, A-G, next to questions 14-  18. 14 pillows     .......................... 15 washing powder   .......................... 16 key     .......................... 17 light bulbs    .......................... 18    map  .......................... Questions 19 and 20 Write ONE WORD AND/OR A NUMBER for each answer. The best place to park in town – next to the station Phone number for takeaway pizzas –",
                        "afterInput": "",
                        "answer": "732281"
                    },
                    {
                        "id": 4020,
                        "number": 20,
                        "beforeInput": "Railway museum closed on",
                        "afterInput": "",
                        "answer": "Thursday/Thursdays"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-41",
        "title": "Listening Test 41",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 27-30",
                "questions": [
                    {
                        "id": 4128,
                        "number": 28,
                        "beforeInput": "Next steps Get approval from  27  ........................... Complete a",
                        "afterInput": "form",
                        "answer": "project request"
                    },
                    {
                        "id": 4130,
                        "number": 30,
                        "beforeInput": "Book a  29  .......................... with the systems analyst Set up a",
                        "afterInput": "with technologies team",
                        "answer": "conference call"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-42",
        "title": "Listening Test 42",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 23-26",
                "questions": [
                    {
                        "id": 4223,
                        "number": 23,
                        "beforeInput": "George's experience of university George is studying Mechanical Engineering which involves several disciplines. He is finding",
                        "afterInput": "the most difficult. At the moment, his course is",
                        "answer": "mathematics/math(s)"
                    },
                    {
                        "id": 4224,
                        "number": 24,
                        "beforeInput": "mainly",
                        "afterInput": ".",
                        "answer": "theory/theoretical"
                    },
                    {
                        "id": 4225,
                        "number": 25,
                        "beforeInput": "He will soon have an assignment which involves a study of",
                        "afterInput": "",
                        "answer": "jet engines"
                    },
                    {
                        "id": 4226,
                        "number": 26,
                        "beforeInput": "He thinks there are too many",
                        "afterInput": "and would like less of them.",
                        "answer": "seminars"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-43",
        "title": "Listening Test 43",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 4301,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4302,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4303,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4304,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4305,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4306,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4307,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4308,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4309,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4310,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-44",
        "title": "Listening Test 44",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 4401,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4402,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4403,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4404,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4405,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4406,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4407,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4408,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4409,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 4410,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-45",
        "title": "Listening Test 45",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "A website",
                "instruction": "Questions 26-30.",
                "questions": [
                    {
                        "id": 4526,
                        "number": 26,
                        "beforeInput": "B locations C designs D TV advertising campaigns E quality F values G software programs History of Furniture Rossi The product",
                        "afterInput": "led to a wider customer base.",
                        "answer": "E"
                    },
                    {
                        "id": 4527,
                        "number": 27,
                        "beforeInput": "Greater customer demand meant other",
                        "afterInput": "........ .... were needed.",
                        "answer": "B"
                    },
                    {
                        "id": 4528,
                        "number": 28,
                        "beforeInput": "Better",
                        "afterInput": "........... increased overall profitability.",
                        "answer": "G"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-46",
        "title": "Listening Test 46",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 27-30",
                "questions": [
                    {
                        "id": 4627,
                        "number": 27,
                        "beforeInput": "What TWO biofuel-related problems do Mike and Karina decide to focus on in the last section of their presentation?  •",
                        "afterInput": "",
                        "answer": "(global) hunger"
                    },
                    {
                        "id": 4628,
                        "number": 28,
                        "beforeInput": "•",
                        "afterInput": "",
                        "answer": "pollution"
                    },
                    {
                        "id": 4629,
                        "number": 29,
                        "beforeInput": "Which two sources of biofuel do Mike and Kerina say are being tried out?  •",
                        "afterInput": "",
                        "answer": "wood"
                    },
                    {
                        "id": 4630,
                        "number": 30,
                        "beforeInput": "- algae  •",
                        "afterInput": "",
                        "answer": "grass(es)"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-47",
        "title": "Listening Test 47",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 27-30",
                "questions": [
                    {
                        "id": 4727,
                        "number": 27,
                        "beforeInput": "Notes on specific sections of marketing report Executive summary - Give a brief overview including the",
                        "afterInput": "",
                        "answer": "background"
                    },
                    {
                        "id": 4728,
                        "number": 28,
                        "beforeInput": "Problems - Link each problem to a",
                        "afterInput": "which explains it",
                        "answer": "theory"
                    },
                    {
                        "id": 4729,
                        "number": 29,
                        "beforeInput": "Implementation - Practical solution to problems - Include details such as participants,",
                        "afterInput": "and sequence",
                        "answer": "cost(s)"
                    },
                    {
                        "id": 4730,
                        "number": 30,
                        "beforeInput": "- Selection is often poorly done because of lack of",
                        "afterInput": "",
                        "answer": "time"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-48",
        "title": "Listening Test 48",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 28-30",
                "questions": [
                    {
                        "id": 4828,
                        "number": 28,
                        "beforeInput": "Stewart's work placement: benefits to the Central Museum Association - his understanding of the Association's",
                        "afterInput": "",
                        "answer": "aims/objectives/goals"
                    },
                    {
                        "id": 4829,
                        "number": 29,
                        "beforeInput": "- the reduction in expense - increased co-operation between",
                        "afterInput": "",
                        "answer": "staff"
                    },
                    {
                        "id": 4830,
                        "number": 30,
                        "beforeInput": "- continuous",
                        "afterInput": "which led to a better product",
                        "answer": "feedback"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-49",
        "title": "Listening Test 49",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 21-23",
                "questions": [
                    {
                        "id": 4921,
                        "number": 21,
                        "beforeInput": "DIFFERENCES BETWEEN INDIVIDUALS  IN THE WORKPLACE Individuals bring different: - ideas  •",
                        "afterInput": "",
                        "answer": "attitude(s)"
                    },
                    {
                        "id": 4922,
                        "number": 22,
                        "beforeInput": "- learning experiences Work behaviour differences are due to: - personality  •",
                        "afterInput": "",
                        "answer": "gender/sex"
                    },
                    {
                        "id": 4923,
                        "number": 23,
                        "beforeInput": "Effects of diversity on companies: Advantage: diversity develops",
                        "afterInput": "",
                        "answer": "creativity/creativeness"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-50",
        "title": "Listening Test 50",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 21-26",
                "questions": [
                    {
                        "id": 5027,
                        "number": 27,
                        "beforeInput": "21 The Antarctic Centre was established in Christchurch because A  New Zealand is a member of the Antarctic Treaty. B Christchurch is geographically well positioned. C the climate of Christchurch is suitable. 22 One role of the Antarctic Centre is to A provide expeditions with suitable equipment. B provide researchers with financial assistance. C ensure that research is internationally relevant. 23 The purpose of the Visitors' Centre is to A provide accommodation. B run training sessions. C show people what Antarctica is like. 24 Dr Merrywhether says that Antarctica is A  unlike any other country. B extremely beautiful. C too cold for tourists. 25 According to Dr Merrywhether, Antarctica is very cold because A  of the shape of the continent. B it is surrounded by a frozen sea. C it is an extremely dry continent. 26 Dr Merrywhether thinks Antarctica was part of another continent because A  he has done his own research in the area. B there is geological evidence of this. C  it is very close to South America.  Proper English School | 90 770-99-77  80 Questions 27 and 28 Write ONE WORD AND/OR TWO NUMBERS for each answer.  ANTARCTIC TREATY  Date Event 1870  Polar Research meeting",
                        "afterInput": "to ..................  1st International Polar Year",
                        "answer": "1882 (to/-) (18)83"
                    },
                    {
                        "id": 5028,
                        "number": 28,
                        "beforeInput": "1957  Antarctic Treaty was proposed 1959  Antarctic Treaty was",
                        "afterInput": "",
                        "answer": "Signed"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-51",
        "title": "Listening Test 51",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 5101,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5102,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5103,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5104,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5105,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5106,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5107,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5108,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5109,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5110,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-52",
        "title": "Listening Test 52",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 27-30",
                "questions": [
                    {
                        "id": 5227,
                        "number": 27,
                        "beforeInput": "Information/visual aid  Where from? Overhead projector   the",
                        "afterInput": "",
                        "answer": "media room"
                    },
                    {
                        "id": 5228,
                        "number": 28,
                        "beforeInput": "Map of West Africa  the",
                        "afterInput": "",
                        "answer": "resources room"
                    },
                    {
                        "id": 5229,
                        "number": 29,
                        "beforeInput": "Map of the islands  a tourist brochure Literacy figures  the",
                        "afterInput": "",
                        "answer": "embassy"
                    },
                    {
                        "id": 5230,
                        "number": 30,
                        "beforeInput": "",
                        "afterInput": "on school places  as above",
                        "answer": "statistics/stats"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-53",
        "title": "Listening Test 53",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 5301,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5302,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5303,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5304,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5305,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5306,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5307,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5308,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5309,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5310,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-54",
        "title": "Listening Test 54",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 25-30",
                "questions": [
                    {
                        "id": 5425,
                        "number": 25,
                        "beforeInput": "Looking for Asian honey bees Birds called Rainbow Bee Eaters eat only",
                        "afterInput": "and cough up",
                        "answer": "insects"
                    },
                    {
                        "id": 5426,
                        "number": 26,
                        "beforeInput": "small bits of skeleton and other products in a pellet. Researchers go to the locations the bee eaters like to use for",
                        "afterInput": "",
                        "answer": "feeding/eating"
                    },
                    {
                        "id": 5427,
                        "number": 27,
                        "beforeInput": "They collect the pellets and take them to a",
                        "afterInput": "for analysis.",
                        "answer": "laboratory"
                    },
                    {
                        "id": 5428,
                        "number": 28,
                        "beforeInput": "Here",
                        "afterInput": "is used to soften them, and the researchers look for the",
                        "answer": "water"
                    },
                    {
                        "id": 5429,
                        "number": 29,
                        "beforeInput": "",
                        "afterInput": "of Asian bees in the pellets.",
                        "answer": "wings"
                    },
                    {
                        "id": 5430,
                        "number": 30,
                        "beforeInput": "The benefit of this research is that the result is more",
                        "afterInput": "than",
                        "answer": "reliable/accurate"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-55",
        "title": "Listening Test 55",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 5501,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5502,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5503,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5504,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5505,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5506,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5507,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5508,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5509,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5510,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-56",
        "title": "Listening Test 56",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 27-30",
                "questions": [
                    {
                        "id": 5627,
                        "number": 27,
                        "beforeInput": "Advice on exam preparation Make sure you know the exam requirements Find some past papers Work out your",
                        "afterInput": "for revision",
                        "answer": "priorities"
                    },
                    {
                        "id": 5628,
                        "number": 28,
                        "beforeInput": "and write them on a card Make a",
                        "afterInput": "and keep it in view",
                        "answer": "timetable"
                    },
                    {
                        "id": 5629,
                        "number": 29,
                        "beforeInput": "Divide revision into",
                        "afterInput": "for each day",
                        "answer": "(small) tasks"
                    },
                    {
                        "id": 5630,
                        "number": 30,
                        "beforeInput": "Write one",
                        "afterInput": "about each topic",
                        "answer": "(single) paragraph"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-57",
        "title": "Listening Test 57",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 5701,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5702,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5703,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5704,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5705,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5706,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5707,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5708,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5709,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 5710,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-58",
        "title": "Listening Test 58",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 25-30",
                "questions": [
                    {
                        "id": 5825,
                        "number": 25,
                        "beforeInput": "Necessary improvements to the existing Self-Access Centre  Equipment Replace computers to create more space.  Resources The level of the",
                        "afterInput": "materials, in particular, should be more clearly",
                        "answer": "reading"
                    },
                    {
                        "id": 5826,
                        "number": 26,
                        "beforeInput": "shown. Update the",
                        "afterInput": "collection.",
                        "answer": "CD"
                    },
                    {
                        "id": 5827,
                        "number": 27,
                        "beforeInput": "Buy some",
                        "afterInput": "and divide them up.",
                        "answer": "workbooks"
                    },
                    {
                        "id": 5828,
                        "number": 28,
                        "beforeInput": "Use of the room Speak to the teachers and organise a",
                        "afterInput": "for supervising the centre.",
                        "answer": "timetable/schedule"
                    },
                    {
                        "id": 5829,
                        "number": 29,
                        "beforeInput": "Install an",
                        "afterInput": ".",
                        "answer": "alarm"
                    },
                    {
                        "id": 5830,
                        "number": 30,
                        "beforeInput": "Restrict personal use of",
                        "afterInput": "on computers.",
                        "answer": "email/emails"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-59",
        "title": "Listening Test 59",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 21-30",
                "questions": [
                    {
                        "id": 5921,
                        "number": 21,
                        "beforeInput": "Study Skills Tutorial – Caroline Benning Dissertation topic:                  the",
                        "afterInput": "",
                        "answer": "fishing industry"
                    },
                    {
                        "id": 5922,
                        "number": 22,
                        "beforeInput": "Strengths:  •",
                        "afterInput": "",
                        "answer": "statistics"
                    },
                    {
                        "id": 5923,
                        "number": 23,
                        "beforeInput": "- computer modelling Weaknesses:  • lack of background information - poor",
                        "afterInput": "skills",
                        "answer": "note-taking"
                    },
                    {
                        "id": 5924,
                        "number": 24,
                        "beforeInput": "Possible strategy  Benefits  Problems peer group discussion  increases",
                        "afterInput": "dissertations tend to",
                        "answer": "confidence"
                    },
                    {
                        "id": 5925,
                        "number": 25,
                        "beforeInput": "contain the same",
                        "afterInput": "",
                        "answer": "ideas"
                    },
                    {
                        "id": 5926,
                        "number": 26,
                        "beforeInput": "use the",
                        "afterInput": "",
                        "answer": "student support"
                    },
                    {
                        "id": 5927,
                        "number": 27,
                        "beforeInput": "service provides structured programme limited",
                        "afterInput": "",
                        "answer": "places"
                    },
                    {
                        "id": 5928,
                        "number": 28,
                        "beforeInput": "consult study skills books  are a good source of reference  can be too",
                        "afterInput": "",
                        "answer": "general"
                    },
                    {
                        "id": 5929,
                        "number": 29,
                        "beforeInput": "Recommendations: - use a card index -    read all notes",
                        "afterInput": "",
                        "answer": "3 times"
                    },
                    {
                        "id": 5930,
                        "number": 30,
                        "beforeInput": "Next tutorial date:",
                        "afterInput": "January",
                        "answer": "25"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-60",
        "title": "Listening Test 60",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 6001,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6002,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6003,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6004,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6005,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6006,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6007,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6008,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6009,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6010,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-61",
        "title": "Listening Test 61",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 6101,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6102,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6103,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6104,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6105,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6106,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6107,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6108,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6109,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6110,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-62",
        "title": "Listening Test 62",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 6231,
                        "number": 31,
                        "beforeInput": "Preparing and Giving a Presentation Initial thoughts Most important consideration: your audience Three points to bear in mind: - what they need to know - how",
                        "afterInput": "they will be",
                        "answer": "supportive"
                    },
                    {
                        "id": 6232,
                        "number": 32,
                        "beforeInput": "- how big the audience will be  Structure Start with information that makes the audience",
                        "afterInput": "",
                        "answer": "pay attention"
                    },
                    {
                        "id": 6233,
                        "number": 33,
                        "beforeInput": "End with",
                        "afterInput": "",
                        "answer": "next steps"
                    },
                    {
                        "id": 6234,
                        "number": 34,
                        "beforeInput": "Design The presentation needs to be",
                        "afterInput": "",
                        "answer": "consistent"
                    },
                    {
                        "id": 6235,
                        "number": 35,
                        "beforeInput": "Vary content by using a mix of words and",
                        "afterInput": "",
                        "answer": "graphics"
                    },
                    {
                        "id": 6236,
                        "number": 36,
                        "beforeInput": "Presenting Look at the audience, be enthusiastic and energetic Voice – vary speed and",
                        "afterInput": "",
                        "answer": "tone"
                    },
                    {
                        "id": 6237,
                        "number": 37,
                        "beforeInput": "Occasionally add",
                        "afterInput": "for greater impact",
                        "answer": "(a) silence / silences"
                    },
                    {
                        "id": 6238,
                        "number": 38,
                        "beforeInput": "Do not use",
                        "afterInput": "(e.g. appears, seems)",
                        "answer": "weak verbs"
                    },
                    {
                        "id": 6239,
                        "number": 39,
                        "beforeInput": "Questions and Interruptions When asked a question, first of all you should",
                        "afterInput": "",
                        "answer": "repeat it"
                    },
                    {
                        "id": 6240,
                        "number": 40,
                        "beforeInput": "Minimise interruptions by",
                        "afterInput": "them",
                        "answer": "predicting"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-63",
        "title": "Listening Test 63",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-38",
                "questions": [
                    {
                        "id": 6331,
                        "number": 31,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer.  HAIR Facts about hair - main purpose – warmth and",
                        "afterInput": "",
                        "answer": "protection"
                    },
                    {
                        "id": 6332,
                        "number": 32,
                        "beforeInput": "- main component keratin – makes fingernails",
                        "afterInput": "",
                        "answer": "flexible"
                    },
                    {
                        "id": 6333,
                        "number": 33,
                        "beforeInput": "- full head of hair can support a large weight – equal to two",
                        "afterInput": "",
                        "answer": "elephants"
                    },
                    {
                        "id": 6334,
                        "number": 34,
                        "beforeInput": "- average number of strands of hair –",
                        "afterInput": "for an adult",
                        "answer": "100 000/100,000"
                    },
                    {
                        "id": 6335,
                        "number": 35,
                        "beforeInput": "- large amount of money spent on",
                        "afterInput": "for hair in the UK",
                        "answer": "products"
                    },
                    {
                        "id": 6336,
                        "number": 36,
                        "beforeInput": "Structure of hair Three main parts: a) bulb – like a",
                        "afterInput": "over end of hair follicle",
                        "answer": "cap"
                    },
                    {
                        "id": 6337,
                        "number": 37,
                        "beforeInput": "b) root – contains glands that supply",
                        "afterInput": "to hair strand",
                        "answer": "oil"
                    },
                    {
                        "id": 6338,
                        "number": 38,
                        "beforeInput": "c) shaft – not",
                        "afterInput": "",
                        "answer": "active"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 39-40",
                "questions": [
                    {
                        "id": 6339,
                        "number": 39,
                        "beforeInput": "Health and Hair Changes in diet will take longer to affect your hair than your",
                        "afterInput": ".",
                        "answer": "skin"
                    },
                    {
                        "id": 6340,
                        "number": 40,
                        "beforeInput": "Vitamins C, D and E are all important for healthy hair and",
                        "afterInput": "are one",
                        "answer": "blue(-)berries"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-64",
        "title": "Listening Test 64",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 6431,
                        "number": 31,
                        "beforeInput": "Write ONE WORD for each answer. Kite-making by the Maori people of New Zealand Making and appearance of the kites - The priests who made the kites had rules for size and scale -",
                        "afterInput": "was not allowed during a kite's preparation",
                        "answer": "food"
                    },
                    {
                        "id": 6432,
                        "number": 32,
                        "beforeInput": "Kites: - often represented a bird, a god, or a",
                        "afterInput": "",
                        "answer": "hero"
                    },
                    {
                        "id": 6433,
                        "number": 33,
                        "beforeInput": "- had frames that were decorated with grasses and",
                        "afterInput": "",
                        "answer": "feathers"
                    },
                    {
                        "id": 6434,
                        "number": 34,
                        "beforeInput": "- had a line of noisy",
                        "afterInput": "attached to them.",
                        "answer": "shells"
                    },
                    {
                        "id": 6435,
                        "number": 35,
                        "beforeInput": "- could be triangular, rectangular or",
                        "afterInput": "shaped.",
                        "answer": "diamond"
                    },
                    {
                        "id": 6436,
                        "number": 36,
                        "beforeInput": "- had patterns made from clay mixed with",
                        "afterInput": "oil.",
                        "answer": "shark"
                    },
                    {
                        "id": 6437,
                        "number": 37,
                        "beforeInput": "- sometimes had human-head masks with",
                        "afterInput": "and a tattoo.",
                        "answer": "teeth"
                    },
                    {
                        "id": 6438,
                        "number": 38,
                        "beforeInput": "Purpose and function of kites: - a way of sending",
                        "afterInput": "to the gods",
                        "answer": "messages"
                    },
                    {
                        "id": 6439,
                        "number": 39,
                        "beforeInput": "- a way of telling other villages that a",
                        "afterInput": "was necessary",
                        "answer": "meeting"
                    },
                    {
                        "id": 6440,
                        "number": 40,
                        "beforeInput": "- a means of",
                        "afterInput": "if enemies were coming.",
                        "answer": "escape"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-65",
        "title": "Listening Test 65",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-36",
                "questions": [
                    {
                        "id": 6531,
                        "number": 31,
                        "beforeInput": "Rock art Why rock art is important to researchers It provides evidence about -    evolution  •",
                        "afterInput": "",
                        "answer": "migration"
                    },
                    {
                        "id": 6532,
                        "number": 32,
                        "beforeInput": "Global similarities in rock art - humans often had large",
                        "afterInput": "",
                        "answer": "eyes"
                    },
                    {
                        "id": 6533,
                        "number": 33,
                        "beforeInput": "- animals were common, but a",
                        "afterInput": "was always drawn from the",
                        "answer": "lizard"
                    },
                    {
                        "id": 6534,
                        "number": 34,
                        "beforeInput": "side or from above - unlikely that contact through",
                        "afterInput": "resulted in similar artistic",
                        "answer": "trade"
                    },
                    {
                        "id": 6535,
                        "number": 35,
                        "beforeInput": "styles Why our ancestors produced rock art Research suggests rock art was produced - firstly for reasons of",
                        "afterInput": "",
                        "answer": "survival"
                    },
                    {
                        "id": 6536,
                        "number": 36,
                        "beforeInput": "- later for social, spiritual and",
                        "afterInput": "reasons.",
                        "answer": "political"
                    }
                ]
            },
            {
                "title": "Section",
                "instruction": "Questions 37-40",
                "questions": [
                    {
                        "id": 6537,
                        "number": 37,
                        "beforeInput": "Complete the questions below. What TWO images   drawn   by   Aboriginal   people   show   their   contact   with  Europeans?  •",
                        "afterInput": "",
                        "answer": "& 38  IN EITHER ORDER"
                    },
                    {
                        "id": 6538,
                        "number": 38,
                        "beforeInput": "•",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6539,
                        "number": 39,
                        "beforeInput": "Which human activities does the lecturer say are the main threats to Aboriginal rock art?  •",
                        "afterInput": "",
                        "answer": "& 40  IN EITHER ORDER"
                    },
                    {
                        "id": 6540,
                        "number": 40,
                        "beforeInput": "- vandalism  •",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-66",
        "title": "Listening Test 66",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-34",
                "questions": [
                    {
                        "id": 6631,
                        "number": 31,
                        "beforeInput": "The 'weak-tie' theory: how friends-of-friends influence us In 1973, Mark Granovetter claimed that the influence of 'weak-ties' can affect the behavior of populations in the fields of information science, politics and",
                        "afterInput": ". Although friends-of-friends may be unlike us, they have similar",
                        "answer": "marketing"
                    },
                    {
                        "id": 6632,
                        "number": 32,
                        "beforeInput": "enough",
                        "afterInput": "to have a beneficial effect on our lives. An example of this",
                        "answer": "interests"
                    },
                    {
                        "id": 6633,
                        "number": 33,
                        "beforeInput": "influence is when we hear about",
                        "afterInput": "because information about",
                        "answer": "jobs"
                    },
                    {
                        "id": 6634,
                        "number": 34,
                        "beforeInput": "them is provided by weak-ties. Since Granovetter proposed his theory, other studies have shown that weak-tie networks also benefit our",
                        "afterInput": ".",
                        "answer": "health"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-67",
        "title": "Listening Test 67",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 6731,
                        "number": 31,
                        "beforeInput": "History of Fireworks in Europe 13th-16th centuries - Fireworks were introduced from China. - Their use was mainly to do with: - war -",
                        "afterInput": "(in plays and festivals)",
                        "answer": "religion(s)"
                    },
                    {
                        "id": 6732,
                        "number": 32,
                        "beforeInput": "17th century - Various features of",
                        "afterInput": "were shown in fireworks displays.",
                        "answer": "nature"
                    },
                    {
                        "id": 6733,
                        "number": 33,
                        "beforeInput": "- Scientists were interested in using ideas from fireworks displays: - to make human",
                        "afterInput": "possible",
                        "answer": "flight"
                    },
                    {
                        "id": 6734,
                        "number": 34,
                        "beforeInput": "- to show the formation of",
                        "afterInput": "",
                        "answer": "stars"
                    },
                    {
                        "id": 6735,
                        "number": 35,
                        "beforeInput": "• London: - Scientists were distrustful at first - Later, they investigated",
                        "afterInput": "uses of",
                        "answer": "practical"
                    },
                    {
                        "id": 6736,
                        "number": 36,
                        "beforeInput": "fireworks (e.g. for sailors)  • St Petersburg: - Fireworks were seen as a method of",
                        "afterInput": "for people",
                        "answer": "education"
                    },
                    {
                        "id": 6737,
                        "number": 37,
                        "beforeInput": "• Paris: - Displays emphasised the power of the",
                        "afterInput": "",
                        "answer": "king"
                    },
                    {
                        "id": 6738,
                        "number": 38,
                        "beforeInput": "- Scientists aimed to provide",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 6739,
                        "number": 39,
                        "beforeInput": "18th century - Italian fireworks specialists became influential. - Servandoni's fireworks display followed the same pattern as an",
                        "afterInput": ".",
                        "answer": "opera"
                    },
                    {
                        "id": 6740,
                        "number": 40,
                        "beforeInput": "- The appeal of fireworks extended to the middle classes. - Some displays demonstrated new scientific discoveries, such as",
                        "afterInput": ".",
                        "answer": "electricity"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-68",
        "title": "Listening Test 68",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 6831,
                        "number": 31,
                        "beforeInput": "New Caledonian crows and the use of tools - some chimpanzees use stones to break nuts - Betty (New Caledonian crow) made a",
                        "afterInput": "out of wire to move a bucket of",
                        "answer": "hook"
                    },
                    {
                        "id": 6832,
                        "number": 32,
                        "beforeInput": "food New Zealand and Oxford experiment - Three stages: crows needed to move a",
                        "afterInput": "in order to reach a short",
                        "answer": "string"
                    },
                    {
                        "id": 6833,
                        "number": 33,
                        "beforeInput": "stick; then use the short stick to reach a long stick; then use the long stick to reach food Oxford research - crows used sticks to investigate whether there was any",
                        "afterInput": "from an",
                        "answer": "danger"
                    },
                    {
                        "id": 6834,
                        "number": 34,
                        "beforeInput": "object - research was inspired by seeing crows using tools on a piece of cloth to investigate a spider design - Barney used a stick to investigate a snake made of",
                        "afterInput": "",
                        "answer": "rubber"
                    },
                    {
                        "id": 6835,
                        "number": 35,
                        "beforeInput": "- Pierre used a stick to investigate a",
                        "afterInput": "",
                        "answer": "light"
                    },
                    {
                        "id": 6836,
                        "number": 36,
                        "beforeInput": "- Corbeau used a stick to investigate a metal toad - the crows only used sticks for the first contact Conclusions of above research - ability to plan provides interesting evidence of the birds' cognition - unclear whether this is evidence of the birds'",
                        "afterInput": "",
                        "answer": "intelligence"
                    },
                    {
                        "id": 6837,
                        "number": 37,
                        "beforeInput": "Exeter and Oxford research in New Caledonia - scientists have attached very small cameras to birds'",
                        "afterInput": "",
                        "answer": "tail(s)"
                    },
                    {
                        "id": 6838,
                        "number": 38,
                        "beforeInput": "- food in the form of beetle larvae provides plenty of",
                        "afterInput": "for the birds",
                        "answer": "energy"
                    },
                    {
                        "id": 6839,
                        "number": 39,
                        "beforeInput": "- larvae's specific",
                        "afterInput": "composition can be identified in birds that feed on",
                        "answer": "chemical"
                    },
                    {
                        "id": 6840,
                        "number": 40,
                        "beforeInput": "them - scientists will analyse what the birds include in their",
                        "afterInput": "",
                        "answer": "diet"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-69",
        "title": "Listening Test 69",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-35",
                "questions": [
                    {
                        "id": 6931,
                        "number": 31,
                        "beforeInput": "SEMINAR ON ROCK ART Preparation for fieldwork trip to Namibia in",
                        "afterInput": "",
                        "answer": "April"
                    },
                    {
                        "id": 6932,
                        "number": 32,
                        "beforeInput": "Rock art in Namibia may be - paintings - engravings Earliest explanation of engravings of animal footprints They were used to help",
                        "afterInput": "learn about tracking",
                        "answer": "children"
                    },
                    {
                        "id": 6933,
                        "number": 33,
                        "beforeInput": "But: - Why are the tracks usually",
                        "afterInput": "?",
                        "answer": "repeated"
                    },
                    {
                        "id": 6934,
                        "number": 34,
                        "beforeInput": "- Why are some engravings realistic and others unrealistic? - Why are the unrealistic animals sometimes half",
                        "afterInput": "?",
                        "answer": "human"
                    },
                    {
                        "id": 6935,
                        "number": 35,
                        "beforeInput": "More recent explanation: Wise men may have been trying to control wild animals with",
                        "afterInput": "",
                        "answer": "magic"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-70",
        "title": "Listening Test 70",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 36-40",
                "questions": [
                    {
                        "id": 7036,
                        "number": 36,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer. Sport  Best laterality  Comments Hockey  mixed laterality  • hockey stick has to be used in",
                        "afterInput": "",
                        "answer": "2 directions"
                    },
                    {
                        "id": 7037,
                        "number": 37,
                        "beforeInput": "- mixed-handed   players   found   to   be   much   more",
                        "afterInput": "than others",
                        "answer": "confident"
                    },
                    {
                        "id": 7038,
                        "number": 38,
                        "beforeInput": "Tennis  single laterality  • gives a larger relevant field of",
                        "afterInput": "",
                        "answer": "vision"
                    },
                    {
                        "id": 7039,
                        "number": 39,
                        "beforeInput": "- cross-lateral players make",
                        "afterInput": "too late",
                        "answer": "corrections"
                    },
                    {
                        "id": 7040,
                        "number": 40,
                        "beforeInput": "Gymnastics  cross laterality  • gymnasts’",
                        "afterInput": "is  important  for",
                        "answer": "balance"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-71",
        "title": "Listening Test 71",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 35-40",
                "questions": [
                    {
                        "id": 7135,
                        "number": 35,
                        "beforeInput": "A company providing luxury serviced apartments aims to: - cater specifically for",
                        "afterInput": "travellers",
                        "answer": "business"
                    },
                    {
                        "id": 7136,
                        "number": 36,
                        "beforeInput": "- provide a stylish",
                        "afterInput": "for guests to use",
                        "answer": "kitchen"
                    },
                    {
                        "id": 7137,
                        "number": 37,
                        "beforeInput": "- set a trend throughout the",
                        "afterInput": "which becomes permanent",
                        "answer": "world"
                    },
                    {
                        "id": 7138,
                        "number": 38,
                        "beforeInput": "Traditional holiday hotels attract people by: - offering the chance to",
                        "afterInput": "their ordinary routine life",
                        "answer": "escape"
                    },
                    {
                        "id": 7139,
                        "number": 39,
                        "beforeInput": "- making sure that they are cared for in all respects – like a",
                        "afterInput": "",
                        "answer": "baby"
                    },
                    {
                        "id": 7140,
                        "number": 40,
                        "beforeInput": "- leaving small treats in their rooms – e.g. cosmetics or",
                        "afterInput": "",
                        "answer": "chocolate"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-72",
        "title": "Listening Test 72",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 34-40",
                "questions": [
                    {
                        "id": 7234,
                        "number": 34,
                        "beforeInput": "Monosodium Glutamate (MSG) - MSG contains - glutamate (78.2%) - sodium (12.2%)  -",
                        "afterInput": "(9.6%)",
                        "answer": "water"
                    },
                    {
                        "id": 7235,
                        "number": 35,
                        "beforeInput": "- Glutamate is found in foods that contain protein such as",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7236,
                        "number": 36,
                        "beforeInput": "and",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7237,
                        "number": 37,
                        "beforeInput": "- MSG is used in foods in many different parts of the world. - In 1908 Kikunae Ikeda discovered a",
                        "afterInput": ".",
                        "answer": "5th/new taste"
                    },
                    {
                        "id": 7238,
                        "number": 38,
                        "beforeInput": "- Our ability to detect glutamate makes sense because it is so",
                        "afterInput": "naturally.",
                        "answer": "common"
                    },
                    {
                        "id": 7239,
                        "number": 39,
                        "beforeInput": "- John Prescott suggests that: -sweetness tells us that a food contains carbohydrates. -",
                        "afterInput": "tells us that a food contains toxins.",
                        "answer": "bitterness"
                    },
                    {
                        "id": 7240,
                        "number": 40,
                        "beforeInput": "- sourness tells us that a food is spoiled. - saltiness tells us that a food contains",
                        "afterInput": ".",
                        "answer": "minerals"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-73",
        "title": "Listening Test 73",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 7331,
                        "number": 31,
                        "beforeInput": "Geography Studying geography helps us to understand: - The effects of different processes on the",
                        "afterInput": "of the",
                        "answer": "surface"
                    },
                    {
                        "id": 7332,
                        "number": 32,
                        "beforeInput": "Earth - The dynamic between",
                        "afterInput": "and population",
                        "answer": "environment"
                    },
                    {
                        "id": 7333,
                        "number": 33,
                        "beforeInput": "Two main branches of study: - Physical features - Human lifestyles and their",
                        "afterInput": "",
                        "answer": "impact(s)/effect(s)"
                    },
                    {
                        "id": 7334,
                        "number": 34,
                        "beforeInput": "Specific study areas: biophysical, topographic, political, social, economic, historical and",
                        "afterInput": "geography, and also cartography",
                        "answer": "urban"
                    },
                    {
                        "id": 7335,
                        "number": 35,
                        "beforeInput": "Key point: geography helps us to understand our surroundings and the associated",
                        "afterInput": "",
                        "answer": "problems"
                    },
                    {
                        "id": 7336,
                        "number": 36,
                        "beforeInput": "What do geographers do? - find data – e.g. conduct censuses, collect information in the form of",
                        "afterInput": "using computer and satellite technology",
                        "answer": "images"
                    },
                    {
                        "id": 7337,
                        "number": 37,
                        "beforeInput": "- analyse data – identify",
                        "afterInput": ", e.g. cause and effect",
                        "answer": "patterns"
                    },
                    {
                        "id": 7338,
                        "number": 38,
                        "beforeInput": "- Publish findings in form of: a) maps - easy to carry - can show physical features of large and small areas - BUT a two-dimensional map will always have some",
                        "afterInput": "",
                        "answer": "distortion(s)"
                    },
                    {
                        "id": 7339,
                        "number": 39,
                        "beforeInput": "b) aerial photos - can show vegetation problems,",
                        "afterInput": "density, ocean floor etc.",
                        "answer": "traffic"
                    },
                    {
                        "id": 7340,
                        "number": 40,
                        "beforeInput": "c) Landsat pictures sent to receiving stations - used for monitoring",
                        "afterInput": "conditions etc.",
                        "answer": "weather"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-74",
        "title": "Listening Test 74",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Questions",
                "instruction": "Please refer to audio.",
                "questions": [
                    {
                        "id": 7401,
                        "number": 1,
                        "beforeInput": "Question 1",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7402,
                        "number": 2,
                        "beforeInput": "Question 2",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7403,
                        "number": 3,
                        "beforeInput": "Question 3",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7404,
                        "number": 4,
                        "beforeInput": "Question 4",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7405,
                        "number": 5,
                        "beforeInput": "Question 5",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7406,
                        "number": 6,
                        "beforeInput": "Question 6",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7407,
                        "number": 7,
                        "beforeInput": "Question 7",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7408,
                        "number": 8,
                        "beforeInput": "Question 8",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7409,
                        "number": 9,
                        "beforeInput": "Question 9",
                        "afterInput": "",
                        "answer": "Unknown"
                    },
                    {
                        "id": 7410,
                        "number": 10,
                        "beforeInput": "Question 10",
                        "afterInput": "",
                        "answer": "Unknown"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-75",
        "title": "Listening Test 75",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 35-40",
                "questions": [
                    {
                        "id": 7535,
                        "number": 35,
                        "beforeInput": "Setting up systems based on an existing process Two mistakes Manager tries to: - improve on the original process - create an ideal",
                        "afterInput": "from the best parts of several processes",
                        "answer": "combination/system"
                    },
                    {
                        "id": 7536,
                        "number": 36,
                        "beforeInput": "Cause of problems - information was inaccurate - comparison between the business settings was invalid - disadvantages were overlooked, e.g. effect of changes on",
                        "afterInput": "",
                        "answer": "safety"
                    },
                    {
                        "id": 7537,
                        "number": 37,
                        "beforeInput": "Solution - change",
                        "afterInput": "",
                        "answer": "attitude(s)"
                    },
                    {
                        "id": 7538,
                        "number": 38,
                        "beforeInput": "- impose rigorous",
                        "afterInput": "",
                        "answer": "control(s)"
                    },
                    {
                        "id": 7539,
                        "number": 39,
                        "beforeInput": "- copy original very closely: - physical features of the",
                        "afterInput": "",
                        "answer": "factory/factories"
                    },
                    {
                        "id": 7540,
                        "number": 40,
                        "beforeInput": "- the",
                        "afterInput": "of original employees",
                        "answer": "skills"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-76",
        "title": "Listening Test 76",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 37- 40",
                "questions": [
                    {
                        "id": 7637,
                        "number": 37,
                        "beforeInput": "Rainbow Serpent Project Aim of project: to identify the",
                        "afterInput": "used as the",
                        "answer": "animal/creature"
                    },
                    {
                        "id": 7638,
                        "number": 38,
                        "beforeInput": "basis for the Rainbow Serpent  Yam Period - environmental changes led to higher",
                        "afterInput": "",
                        "answer": "sea/water level(s)"
                    },
                    {
                        "id": 7639,
                        "number": 39,
                        "beforeInput": "- traditional activities were affected, especially",
                        "afterInput": "",
                        "answer": "hunting"
                    },
                    {
                        "id": 7640,
                        "number": 40,
                        "beforeInput": "Rainbow Serpent image - similar to a sea horse - unusual because it appeared in inland areas - symbolises",
                        "afterInput": "in Aboriginal culture",
                        "answer": "creation"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-77",
        "title": "Listening Test 77",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 7731,
                        "number": 31,
                        "beforeInput": "Mass Strandings of Whales and Dolphins Mass strandings: situations where groups of whales, dolphins, etc. swim onto the beach and die Common in areas where the",
                        "afterInput": "can change quickly",
                        "answer": "tide/tides"
                    },
                    {
                        "id": 7732,
                        "number": 32,
                        "beforeInput": "Several other theories:  Parasites e.g. some parasites can affect marine animals'",
                        "afterInput": "which they",
                        "answer": "hearing/ear/ears"
                    },
                    {
                        "id": 7733,
                        "number": 33,
                        "beforeInput": "depend on for navigation  Toxins Poisons from",
                        "afterInput": "or .................. are commonly consumed by whales",
                        "answer": "IN EITHER ORDER;"
                    },
                    {
                        "id": 7734,
                        "number": 34,
                        "beforeInput": "e.g. Cape Cod (1988) – whales were killed by saxitoxin  Accidental Strandings Animals may follow prey ashore, e.g. Thurston (1995) Unlikely because the majority of animals were not",
                        "afterInput": "when they",
                        "answer": "feeding"
                    },
                    {
                        "id": 7735,
                        "number": 35,
                        "beforeInput": "stranded  Human Activity",
                        "afterInput": "from military tests are linked to some recent strandings",
                        "answer": "noise/noises"
                    },
                    {
                        "id": 7736,
                        "number": 36,
                        "beforeInput": "The Bahamas (2000) stranding was unusual because the whales - were all",
                        "afterInput": "",
                        "answer": "healthy"
                    },
                    {
                        "id": 7737,
                        "number": 37,
                        "beforeInput": "- were not in a",
                        "afterInput": "",
                        "answer": "group"
                    },
                    {
                        "id": 7738,
                        "number": 38,
                        "beforeInput": "Group Behaviour - More strandings in the most",
                        "afterInput": "species of whales",
                        "answer": "social"
                    },
                    {
                        "id": 7739,
                        "number": 39,
                        "beforeInput": "- 1994 dolphin stranding   only the",
                        "afterInput": "was ill",
                        "answer": "leader"
                    },
                    {
                        "id": 7740,
                        "number": 40,
                        "beforeInput": "Further Reading Marine Mammals Ashore (Connor) –  gives information about strading",
                        "afterInput": "",
                        "answer": "network/networks"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-78",
        "title": "Listening Test 78",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 31-40",
                "questions": [
                    {
                        "id": 7831,
                        "number": 31,
                        "beforeInput": "Business Cultures Power culture Characteristics of organisation  -  small -",
                        "afterInput": "power source",
                        "answer": "central"
                    },
                    {
                        "id": 7832,
                        "number": 32,
                        "beforeInput": "- few rules and procedures - communication by",
                        "afterInput": "",
                        "answer": "conversation/conversations"
                    },
                    {
                        "id": 7833,
                        "number": 33,
                        "beforeInput": "Advantage:      -   can act quickly Disadvantage:  -   might not act",
                        "afterInput": "",
                        "answer": "effectively"
                    },
                    {
                        "id": 7834,
                        "number": 34,
                        "beforeInput": "Suitable employee:         -   not afraid of",
                        "afterInput": "",
                        "answer": "risk/risks"
                    },
                    {
                        "id": 7835,
                        "number": 35,
                        "beforeInput": "- doesn’t need job security Role culture Characteristics of organisation: -   large, many",
                        "afterInput": "",
                        "answer": "levels"
                    },
                    {
                        "id": 7836,
                        "number": 36,
                        "beforeInput": "-   specialised departments -  rules and procedure e.g. job",
                        "afterInput": "and rules for discipline",
                        "answer": "description/descriptions"
                    },
                    {
                        "id": 7837,
                        "number": 37,
                        "beforeInput": "Advantages:                               -   economies of scale - successful when",
                        "afterInput": "ability is",
                        "answer": "technical"
                    },
                    {
                        "id": 7838,
                        "number": 38,
                        "beforeInput": "important Disadvantages:  -    slow to see when",
                        "afterInput": "needed",
                        "answer": "change"
                    },
                    {
                        "id": 7839,
                        "number": 39,
                        "beforeInput": "- slow to react Suitable employee:               -   values security - doesn’t want",
                        "afterInput": "",
                        "answer": "responsibility"
                    },
                    {
                        "id": 7840,
                        "number": 40,
                        "beforeInput": "Task culture Characteristics of organisation: -   project orientated - in competitive market or making product with short life - a lot of delegation  Advantage:         -",
                        "afterInput": "",
                        "answer": "flexible"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-79",
        "title": "Listening Test 79",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 33-40",
                "questions": [
                    {
                        "id": 7933,
                        "number": 33,
                        "beforeInput": "Write ONE WORD AND/OR A NUMBER for each answer.  The Underground House  Design - Built in the earth, with two floors - The south-facing side was constructed of two layers of",
                        "afterInput": "",
                        "answer": "glass"
                    },
                    {
                        "id": 7934,
                        "number": 34,
                        "beforeInput": "- Photovoltaic tiles were attached - A layer of foam was used to improve the",
                        "afterInput": "of the building",
                        "answer": "insulation"
                    },
                    {
                        "id": 7935,
                        "number": 35,
                        "beforeInput": "Special features - To increase the light, the building has many internal mirrors and",
                        "afterInput": "",
                        "answer": "windows"
                    },
                    {
                        "id": 7936,
                        "number": 36,
                        "beforeInput": "- In future, the house may produce more",
                        "afterInput": "than it needs",
                        "answer": "electricity"
                    },
                    {
                        "id": 7937,
                        "number": 37,
                        "beforeInput": "- Recycled wood was used for the",
                        "afterInput": "of the house",
                        "answer": "floor/floors"
                    },
                    {
                        "id": 7938,
                        "number": 38,
                        "beforeInput": "- The system for processing domestic",
                        "afterInput": "is organic",
                        "answer": "waste"
                    },
                    {
                        "id": 7939,
                        "number": 39,
                        "beforeInput": "Environmental issues - The use of large quantities of",
                        "afterInput": "in construction was environmentally",
                        "answer": "concrete"
                    },
                    {
                        "id": 7940,
                        "number": 40,
                        "beforeInput": "harmful - But the house will have paid its ‘environmental debt’ within",
                        "afterInput": "",
                        "answer": "15 years"
                    }
                ]
            }
        ]
    },
    {
        "id": "test-80",
        "title": "Listening Test 80",
        "audioUrl": "https://drive.google.com/file/d/1dhT20DOcP9N18FOMA1WKus26ziNARucX/preview",
        "sections": [
            {
                "title": "Section",
                "instruction": "Questions 37-40",
                "questions": [
                    {
                        "id": 8037,
                        "number": 37,
                        "beforeInput": "Animals  Reason for population  increase in gardens  Comments",
                        "afterInput": "suitable stretches of water  massive increase in urban",
                        "answer": "frog/frogs"
                    },
                    {
                        "id": 8038,
                        "number": 38,
                        "beforeInput": "population Hedgehogs   safer from",
                        "afterInput": "",
                        "answer": "predators"
                    },
                    {
                        "id": 8039,
                        "number": 39,
                        "beforeInput": "when in cities easy to",
                        "afterInput": "",
                        "answer": "count"
                    },
                    {
                        "id": 8040,
                        "number": 40,
                        "beforeInput": "them accurately Song thrushes  – a variety of",
                        "afterInput": "to eat",
                        "answer": "seed/seeds"
                    }
                ]
            }
        ]
    }
];

// Helper to paginate (client-side matching Firestore limit logic if needed)
export function getPaginatedTests(page: number, limit: number): ListeningTest[] {
    const start = (page - 1) * limit;
    return listeningTests.slice(start, start + limit);
}
