import type { DevotionalItem } from './types';

export const NAMAVALIS: DevotionalItem[] = [
  {
    slug: 'shiva-ashtottara-shatanamavali',
    title: 'Shiva Ashtottara Shatanamavali',
    titleHi: 'शिव अष्टोत्तरशतनामावली',
    deity: 'Shiva', deityHi: 'भगवान शिव',
    icon: '🔱',
    lyricsHi: `१. शिवः २. महेश्वरः ३. शम्भुः ४. पिनाकी ५. शशिशेखरः ६. वामदेवः ७. विरूपाक्षः ८. कपर्दी ९. नीललोहितः १०. शङ्करः
११. शूलपाणिः १२. खट्वाङ्गी १३. विष्णुवल्लभः १४. शिपिविष्टः १५. अम्बिकानाथः १६. श्रीकण्ठः १७. भक्तवत्सलः १८. भवः १९. शर्वः २०. त्रिलोकेशः
२१. शितिकण्ठः २२. शिवाप्रियः २३. उग्रः २४. कपाली २५. कामारिः २६. अन्धकासुरसूदनः २७. गङ्गाधरः २८. ललाटाक्षः २९. कालकालः ३०. कृपानिधिः
३१. भीमः ३२. परशुहस्तः ३३. मृगपाणिः ३४. जटाधरः ३५. कैलासवासी ३६. कवची ३७. कठोरः ३८. त्रिपुरान्तकः ३९. वृषाङ्कः ४०. वृषभारूढः
४१. भस्मोद्धूलितविग्रहः ४२. सामप्रियः ४३. स्वरमयः ४४. त्रयीमूर्तिः ४५. अनीश्वरः ४६. सर्वज्ञः ४७. परमात्मा ४८. सोमसूर्याग्निलोचनः ४९. हविः ५०. यज्ञमयः
५१. सोमः ५२. पञ्चवक्त्रः ५३. सदाशिवः ५४. विश्वेश्वरः ५५. वीरभद्रः ५६. गणनाथः ५७. प्रजापतिः ५८. हिरण्यरेताः ५९. दुर्धर्षः ६०. गिरीशः
६१. गिरिशः ६२. अनघः ६३. भुजङ्गभूषणः ६४. भर्गः ६५. गिरिधन्वा ६६. गिरिप्रियः ६७. कृत्तिवासाः ६८. पुरारातिः ६९. भगवान् ७०. प्रमथाधिपः
७१. मृत्युञ्जयः ७२. सूक्ष्मतनुः ७३. जगद्व्यापी ७४. जगद्गुरुः ७५. व्योमकेशः ७६. महासेनजनकः ७७. चारुविक्रमः ७८. रुद्रः ७९. भूतपतिः ८०. स्थाणुः
८१. अहिर्बुध्न्यः ८२. दिगम्बरः ८३. अष्टमूर्तिः ८४. अनेकात्मा ८५. सात्त्विकः ८६. शुद्धविग्रहः ८७. शाश्वतः ८८. खण्डपरशुः ८९. अजः ९०. पाशविमोचकः
९१. मृडः ९२. पशुपतिः ९३. देवः ९४. महादेवः ९५. अव्ययः ९६. हरिः ९७. पूषदन्तभित् ९८. अव्यग्रः ९९. दक्षाध्वरहरः १००. हरः
१०१. भगनेत्रभित् १०२. अव्यक्तः १०३. सहस्राक्षः १०४. सहस्रपात् १०५. अपवर्गप्रदः १०६. अनन्तः १०७. तारकः १०८. परमेश्वरः`,
    transliteration: `1. Shivah 2. Maheshwarah 3. Shambhuh 4. Pinaki 5. Shashishekharah 6. Vamadevah 7. Virupakshah 8. Kapardi 9. Neelalohitah 10. Shankarah
11. Shoolapanih 12. Khatwangi 13. Vishnuvallabhah 14. Shipivishtah 15. Ambikanathah 16. Shrikanthah 17. Bhaktavatsalah 18. Bhavah 19. Sharvah 20. Trilokeshah
21. Shitikanthah 22. Shivapriyah 23. Ugrah 24. Kapali 25. Kamarih 26. Andhakasurasudanah 27. Gangadharah 28. Lalatakshah 29. Kalakalah 30. Kripanidhih
31. Bhimah 32. Parashuhastah 33. Mrigapanih 34. Jatadharah 35. Kailasavasi 36. Kavachi 37. Kathorah 38. Tripurantakah 39. Vrishankah 40. Vrishabharudhah
41. Bhasmoddhulitavigrahah 42. Samapriyah 43. Svaramayah 44. Trayimurtih 45. Anishwarah 46. Sarvajnah 47. Paramatma 48. Somasuryagnilochanah 49. Havih 50. Yajnamayah
51. Somah 52. Panchavaktrah 53. Sadashivah 54. Vishweshwarah 55. Virabhadrah 56. Gananathah 57. Prajapatih 58. Hiranyaretah 59. Durdharshah 60. Girishah
61. Girishah 62. Anaghah 63. Bhujangabhushanah 64. Bhargah 65. Giridhanva 66. Giripriyah 67. Krittivasah 68. Puraratih 69. Bhagavan 70. Pramathadhipah
71. Mrityunjayah 72. Sukshmatanuh 73. Jagadvyapi 74. Jagadguruh 75. Vyomakeshah 76. Mahasenajanakah 77. Charuvikramah 78. Rudrah 79. Bhutapatih 80. Sthanuh
81. Ahirbudhnyah 82. Digambarah 83. Ashtamurtih 84. Anekatma 85. Sattvikah 86. Shuddhavigrahah 87. Shashwatah 88. Khandaparashuh 89. Ajah 90. Pashavimochakah
91. Mridah 92. Pashupatih 93. Devah 94. Mahadevah 95. Avyayah 96. Harih 97. Pushadantabhit 98. Avyagrah 99. Dakshadhvaraharah 100. Harah
101. Bhaganetrabhit 102. Avyaktah 103. Sahasrakshah 104. Sahasrapat 105. Apavargapradah 106. Anantah 107. Tarakah 108. Parameshwarah.`,
    meaning: 'This is a list of 108 names (Ashtottara Shatanamavali) of Lord Shiva, each describing a different aspect of his form and nature — from Shambhu (the auspicious one) and Nataraja-like Vamadeva, to Mrityunjaya (conqueror of death) and Parameshwara (the supreme lord).', meaningHi: 'यह भगवान शिव के 108 नामों (अष्टोत्तरशतनामावली) की सूची है, जिनमें से प्रत्येक नाम उनके स्वरूप और स्वभाव के एक अलग पक्ष का वर्णन करता है — शंभु (मंगलकारी) और नटराज जैसे वामदेव से लेकर, मृत्युंजय (मृत्यु पर विजयी) और परमेश्वर (सर्वोच्च प्रभु) तक।',
    benefits: 'Recited or used for Archana (offering a flower or bilva leaf with each name) during Shiva puja, especially on Mondays, Pradosh and Maha Shivaratri. Each name may be prefixed with "Om" and suffixed with "Namah" when performing archana.', benefitsHi: 'शिव पूजा के दौरान, विशेष रूप से सोमवार, प्रदोष और महाशिवरात्रि को, प्रत्येक नाम के साथ फूल या बिल्व पत्र अर्पित करते हुए अर्चना के लिए पाठ या उपयोग किया जाता है। अर्चना करते समय प्रत्येक नाम के आगे "ॐ" और अंत में "नमः" जोड़ा जा सकता है।',
  },
  {
    slug: 'ganesh-ashtottara-shatanamavali',
    title: 'Ganesh Ashtottara Shatanamavali',
    titleHi: 'गणेश अष्टोत्तरशतनामावली',
    deity: 'Ganesha', deityHi: 'श्री गणेश जी',
    icon: '🐘',
    lyricsHi: `१. गजाननः २. गणाध्यक्षः ३. विघ्नराजः ४. विनायकः ५. द्वैमातुरः ६. सुमुखः ७. प्रमुखः ८. सन्मुखः ९. कृती १०. ज्ञानदीपः
११. सुखनिधिः १२. सुराध्यक्षः १३. सुरारिभिदः १४. महागणपतिः १५. मान्यः १६. महन्मान्यः १७. मृडात्मजः १८. पुराणः १९. पुरुषः २०. पूषा
२१. पुष्करी २२. पुण्यकृतः २३. अग्रगण्यः २४. अग्रपूज्यः २५. अग्रगामी २६. मन्त्रकृतः २७. चामीकरप्रभः २८. सर्वः २९. सर्वोपास्यः ३०. सर्वकर्ता
३१. सर्वनेता ३२. सर्वसिद्धिप्रदः ३३. सर्वसिद्धः ३४. सर्ववन्द्यः ३५. महाकालः ३६. महाबलः ३७. हेरम्बः ३८. लम्बजठरः ३९. ह्रस्वग्रीवः ४०. महोदरः
४१. मदोत्कटः ४२. महावीरः ४३. मन्त्री ४४. मङ्गलदः ४५. प्रथमाचार्यः ४६. प्राज्ञः ४७. प्रमोदः ४८. मोदकप्रियः ४९. धृतिमान् ५०. मतिमान्
५१. कामी ५२. कपित्थपनसप्रियः ५३. ब्रह्मचारी ५४. ब्रह्मरूपी ५५. ब्रह्मविदः ५६. ब्रह्मवन्दितः ५७. जिष्णुः ५८. विष्णुप्रियः ५९. भक्तजीवितः ६०. जितमन्मथः
६१. ऐश्वर्यदः ६२. गुहज्यायसः ६३. सिद्धसेवितः ६४. विघ्नकर्ता ६५. विघ्नहर्ता ६६. विश्वनेता ६७. विराजः ६८. स्वराजः ६९. श्रीपतिः ७०. वाक्पतिः
७१. श्रीमान् ७२. शृङ्गारी ७३. श्रितवत्सलः ७४. शिवप्रियः ७५. शीघ्रकारी ७६. शाश्वतः ७७. शिवनन्दनः ७८. बलोद्धतः ७९. भक्तनिधिः ८०. भावगम्यः
८१. भवात्मजः ८२. महतः ८३. मङ्गलदायी ८४. महेशः ८५. महितः ८६. सत्यधर्मी ८७. सदाधारः ८८. सत्यः ८९. सत्यपराक्रमः ९०. शुभाङ्गः
९१. शुभ्रदन्तः ९२. शुभदः ९३. शुभविग्रहः ९४. पञ्चपातकनाशी ९५. पार्वतीप्रियनन्दनः ९६. विश्वेशः ९७. विबुधाराध्यपदः ९८. वीरवराग्रगः ९९. कुमारगुरुवन्द्यः १००. कुञ्जरासुरभञ्जनः
१०१. वल्लभावल्लभः १०२. वराभयकराम्बुजः १०३. सुधाकलशहस्तः १०४. सुधाकरकलाधरः १०५. पञ्चहस्तः १०६. प्रधानेशः १०७. पुरातनः १०८. वरसिद्धिविनायकः`,
    transliteration: `1. Gajananah 2. Ganadhyakshah 3. Vighnarajah 4. Vinayakah 5. Dvaimaturah 6. Sumukhah 7. Pramukhah 8. Sanmukhah 9. Kritih 10. Jnanadipah
11. Sukhanidhih 12. Suradhyakshah 13. Suraribhidah 14. Mahaganapatih 15. Manyah 16. Mahanmanyah 17. Mridatmajah 18. Puranah 19. Purushah 20. Pusha
21. Pushkari 22. Punyakritah 23. Agraganyah 24. Agrapujyah 25. Agragami 26. Mantrakritah 27. Chamikaraprabhah 28. Sarvah 29. Sarvopasyah 30. Sarvakarta
31. Sarvaneta 32. Sarvasiddhipradah 33. Sarvasiddhah 34. Sarvavandyah 35. Mahakalah 36. Mahabalah 37. Herambah 38. Lambajatharah 39. Hrasvagrivah 40. Mahodarah
41. Madotkatah 42. Mahaveerah 43. Mantri 44. Mangaladah 45. Prathamacharyah 46. Prajnah 47. Pramodah 48. Modakapriyah 49. Dhritiman 50. Matiman
51. Kami 52. Kapitthapanasapriyah 53. Brahmachari 54. Brahmarupi 55. Brahmavidah 56. Brahmavanditah 57. Jishnuh 58. Vishnupriyah 59. Bhaktajivitah 60. Jitamanmathah
61. Aishvaryadah 62. Guhajyayasah 63. Siddhasevitah 64. Vighnakarta 65. Vighnaharta 66. Vishwaneta 67. Virajah 68. Svarajah 69. Shripatih 70. Vakpatih
71. Shriman 72. Shringari 73. Shritavatsalah 74. Shivapriyah 75. Shighrakari 76. Shashwatah 77. Shivanandanah 78. Baloddhatah 79. Bhaktanidhih 80. Bhavagamyah
81. Bhavatmajah 82. Mahatah 83. Mangaladayi 84. Maheshah 85. Mahitah 86. Satyadharmi 87. Sadadharah 88. Satyah 89. Satyaparakramah 90. Shubhangah
91. Shubhradantah 92. Shubhadah 93. Shubhavigrahah 94. Panchapatakanashi 95. Parvatipriyanandanah 96. Vishweshah 97. Vibudharadhyapadah 98. Viravaragragah 99. Kumaraguruvandyah 100. Kunjarasurabhanjanah
101. Vallabhavallabhah 102. Varabhayakarambujah 103. Sudhakalashahastah 104. Sudhakarakaladharah 105. Panchahastah 106. Pradhaneshah 107. Puratanah 108. Varasiddhivinayakah.`,
    meaning: 'This is a list of 108 names of Lord Ganesha, describing his elephant face, mouse vehicle, role as remover of obstacles (Vighnaraja), and his identity as Siddhivinayaka — the giver of success and spiritual accomplishment.', meaningHi: 'यह भगवान गणेश के 108 नामों की सूची है, जो उनके गजमुख, मूषक वाहन, विघ्नों को दूर करने वाले (विघ्नराज) की भूमिका, और सिद्धि तथा आध्यात्मिक उपलब्धि प्रदान करने वाले सिद्धिविनायक के रूप में उनकी पहचान का वर्णन करती है।',
    benefits: 'Recited or used for Archana with durva grass or red flowers before beginning any new undertaking, and throughout Ganesh Chaturthi, believed to remove obstacles and bring auspicious outcomes.', benefitsHi: 'किसी भी नए कार्य को आरंभ करने से पहले और गणेश चतुर्थी के दौरान दूर्वा घास या लाल फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो बाधाओं को दूर करने और शुभ परिणाम लाने वाला माना जाता है।',
  },
  {
    slug: 'durga-ashtottara-shatanamavali',
    title: 'Durga Ashtottara Shatanamavali',
    titleHi: 'दुर्गा अष्टोत्तरशतनामावली',
    deity: 'Durga', deityHi: 'माँ दुर्गा',
    icon: '🔱',
    lyricsHi: `१. दुर्गा २. शिवा ३. महालक्ष्मी ४. महागौरी ५. चण्डिका ६. सर्वज्ञा ७. सर्वलोकेशी ८. सर्वकर्मफलप्रदा ९. सर्वतीर्थमयी १०. पुण्या
११. देवयोनिः १२. अयोनिजा १३. भूमिजा १४. निर्गुणा १५. आधारशक्तिः १६. अनीश्वरी १७. निर्गुणा १८. निरहङ्कारा १९. सर्वगर्वविमर्दिनी २०. सर्वलोकप्रिया
२१. वाणी २२. सर्वविद्याधिदेवता २३. पार्वती २४. देवमाता २५. वनीशा २६. विन्ध्यवासिनी २७. तेजोवती २८. महामाता २९. कोटिसूर्यसमप्रभा ३०. देवता
३१. वह्निरूपा ३२. सदौजसः ३३. वर्णरूपिणी ३४. गुणाश्रया ३५. गुणमयी ३६. गुणत्रयविवर्जिता ३७. कर्मज्ञानप्रदा ३८. कान्ता ३९. सर्वसंहारकारिणी ४०. धर्मज्ञाना
४१. धर्मनिष्ठा ४२. सर्वकर्मविवर्जिता ४३. कामाक्षी ४४. कामसंहर्त्री ४५. कामक्रोधविवर्जिता ४६. शाङ्करी ४७. शाम्भवी ४८. शान्ता ४९. चन्द्रसूर्याग्निलोचना ५०. सुजया
५१. जयभूमिष्ठा ५२. जाह्नवी ५३. जनपूजिता ५४. शास्त्रा ५५. शास्त्रमया ५६. नित्या ५७. शुभा ५८. चन्द्रार्धमस्तका ५९. भारती ६०. भ्रामरी
६१. कल्पा ६२. कराली ६३. कृष्णपिङ्गला ६४. ब्राह्मी ६५. नारायणी ६६. रौद्री ६७. चन्द्रामृतपरिश्रुता ६८. ज्येष्ठा ६९. इन्दिरा ७०. महामाया
७१. जगत्सृष्ट्यादिकारिणी ७२. ब्रह्माण्डकोटिसंस्थाना ७३. कामिनी ७४. कमलालया ७५. कात्यायनी ७६. कलातीता ७७. कालसंहारकारिणी ७८. योगनिष्ठा ७९. योगिगम्या ८०. योगिध्येया
८१. तपस्विनी ८२. ज्ञानरूपा ८३. निराकारा ८४. भक्ताभीष्टफलप्रदा ८५. भूतात्मिका ८६. भूतमाता ८७. भूतेशा ८८. भूतधारिणी ८९. स्वधानारीमध्यगता ९०. षडाधारादिवर्तिनी
९१. मोहदा ९२. अंशुभवा ९३. शुभ्रा ९४. सूक्ष्मा ९५. मात्रा ९६. निरालसा ९७. निम्नगा ९८. नीलसङ्काशा ९९. नित्यानन्दा १००. हरा
१०१. परा १०२. सर्वज्ञानप्रदा १०३. अनन्ता १०४. सत्या १०५. दुर्लभरूपिणी १०६. सरस्वती १०७. सर्वगता १०८. सर्वाभीष्टप्रदायिनी`,
    transliteration: `1. Durga 2. Shiva 3. Mahalakshmi 4. Mahagauri 5. Chandika 6. Sarvajna 7. Sarvalokeshi 8. Sarvakarmaphalaprada 9. Sarvatirthamayi 10. Punya
11. Devayonih 12. Ayonija 13. Bhumija 14. Nirguna 15. Adharashaktih 16. Anishwari 17. Nirguna 18. Nirahankara 19. Sarvagarvavimardini 20. Sarvalokapriya
21. Vani 22. Sarvavidyadhidevata 23. Parvati 24. Devamata 25. Vanisha 26. Vindhyavasini 27. Tejovati 28. Mahamata 29. Kotisuryasamaprabha 30. Devata
31. Vahnirupa 32. Sadaujasah 33. Varnarupini 34. Gunashraya 35. Gunamayi 36. Gunatrayavivarjita 37. Karmajnanaprada 38. Kanta 39. Sarvasanharakarini 40. Dharmajnana
41. Dharmanishtha 42. Sarvakarmavivarjita 43. Kamakshi 44. Kamasanhartri 45. Kamakrodhavivarjita 46. Shankari 47. Shambhavi 48. Shanta 49. Chandrasuryagnilochana 50. Sujaya
51. Jayabhumishtha 52. Jahnavi 53. Janapujita 54. Shastra 55. Shastramaya 56. Nitya 57. Shubha 58. Chandrardhamastaka 59. Bharati 60. Bhramari
61. Kalpa 62. Karali 63. Krishnapingala 64. Brahmi 65. Narayani 66. Raudri 67. Chandramritaparishruta 68. Jyeshtha 69. Indira 70. Mahamaya
71. Jagatsrishtyadikarini 72. Brahmandakotisansthana 73. Kamini 74. Kamalalaya 75. Katyayani 76. Kalatita 77. Kalasanharakarini 78. Yoganishtha 79. Yogigamya 80. Yogidhyeya
81. Tapasvini 82. Jnanarupa 83. Nirakara 84. Bhaktabhishtaphalaprada 85. Bhutatmika 86. Bhutamata 87. Bhutesha 88. Bhutadharini 89. Svadhanarimadhyagata 90. Shadadharadivartini
91. Mohada 92. Anshubhava 93. Shubhra 94. Sukshma 95. Matra 96. Niralasa 97. Nimnaga 98. Nilasankasha 99. Nityananda 100. Hara
101. Para 102. Sarvajnanaprada 103. Ananta 104. Satya 105. Durlabharupini 106. Saraswati 107. Sarvagata 108. Sarvabhishtapradayini.`,
    meaning: 'This is a list of 108 names of Goddess Durga, encompassing her many forms — Chandika, Kali, Kaushiki, Kaatyayani, the Navadurgas and Mahavidyas — describing her power to destroy evil and protect the universe. Note that the received text names Nirguna twice, at 14 and 17, so the 108 numbered positions carry 107 distinct names. The repetition is in the source stotram itself (verses 2 and 3) and is reproduced here as it stands rather than being quietly altered.', meaningHi: 'यह देवी दुर्गा के 108 नामों की सूची है, जो उनके अनेक रूपों — चंडिका, काली, कौशिकी, कात्यायनी, नवदुर्गा और महाविद्याओं — को समाहित करती है, तथा बुराई का नाश करने और ब्रह्मांड की रक्षा करने की उनकी शक्ति का वर्णन करती है। ध्यान दें कि मूल पाठ में निर्गुणा नाम दो बार आता है — 14 और 17 पर — अतः 108 क्रमांकों में 107 भिन्न नाम हैं। यह पुनरावृत्ति मूल स्तोत्र (श्लोक 2 और 3) में ही है और इसे यहाँ यथावत् रखा गया है।',
    benefits: 'Recited or used for Archana with red hibiscus (japa) flowers during Navratri, Durga Puja and Fridays, invoking the Divine Mother\'s protection and grace.', benefitsHi: 'नवरात्रि, दुर्गा पूजा और शुक्रवार के दिन लाल गुड़हल (जपा) के फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो दिव्य माता की सुरक्षा और कृपा का आह्वान करता है।',
  },
  {
    slug: 'lakshmi-ashtottara-shatanamavali',
    title: 'Lakshmi Ashtottara Shatanamavali',
    titleHi: 'लक्ष्मी अष्टोत्तरशतनामावली',
    deity: 'Lakshmi', deityHi: 'माँ लक्ष्मी',
    icon: '🪙',
    lyricsHi: `१. प्रकृतिः २. विकृतिः ३. विद्या ४. सर्वभूतहितप्रदा ५. श्रद्धा ६. विभूतिः ७. सुरभिः ८. परमात्मिका ९. वाक् १०. पद्मालया
११. पद्मा १२. शुचिः १३. स्वाहा १४. स्वधा १५. सुधा १६. धन्या १७. हिरण्मयी १८. लक्ष्मी १९. नित्यपुष्टा २०. विभावरी
२१. अदिती २२. दिती २३. दीप्ता २४. वसुधा २५. वसुधारिणी २६. कमला २७. कान्ता २८. क्षमा २९. क्षीरोदसंभवा ३०. अनुग्रहपरा
३१. बुद्धिः ३२. अनघा ३३. हरिवल्लभा ३४. अशोका ३५. अमृता ३६. दीप्ता ३७. लोकशोकविनाशिनी ३८. धर्मनिलया ३९. करुणा ४०. लोकमाता
४१. पद्मप्रिया ४२. पद्महस्ता ४३. पद्माक्षी ४४. पद्मसुन्दरी ४५. पद्मोद्भवा ४६. पद्ममुखी ४७. पद्मनाभप्रिया ४८. रमा ४९. पद्ममालाधरा ५०. देवी
५१. पद्मिनी ५२. पद्मगन्धिनी ५३. पुण्यगन्धा ५४. सुप्रसन्ना ५५. प्रसादाभिमुखी ५६. प्रभा ५७. चन्द्रवदना ५८. चन्द्रा ५९. चन्द्रसहोदरी ६०. चतुर्भुजा
६१. चन्द्ररूपा ६२. इन्दिरा ६३. इन्दुशीतला ६४. आह्लादजननी ६५. पुष्टिः ६६. शिवा ६७. शिवकरी ६८. सती ६९. विमला ७०. विश्वजननी
७१. तुष्टिः ७२. दारिद्र्यनाशिनी ७३. प्रीतिपुष्करिणी ७४. शान्ता ७५. शुक्लमाल्याम्बरा ७६. श्रीः ७७. भास्करी ७८. बिल्वनिलया ७९. वरारोहा ८०. यशस्विनी
८१. वसुन्धरा ८२. उदाराङ्गा ८३. हरिणी ८४. हेममालिनी ८५. धनधान्यकरी ८६. सिद्धिः ८७. स्त्रैणसौम्या ८८. शुभप्रदा ८९. नृपवेश्मगतानन्दा ९०. वरलक्ष्मी
९१. वसुप्रदा ९२. शुभा ९३. हिरण्यप्राकारा ९४. समुद्रतनया ९५. जया ९६. मङ्गला देवी ९७. विष्णुवक्षःस्थलस्थिता ९८. विष्णुपत्नी ९९. प्रसन्नाक्षी १००. नारायणसमाश्रिता
१०१. दारिद्र्यध्वंसिनी १०२. देवी १०३. सर्वोपद्रववारिणी १०४. नवदुर्गा १०५. महाकाली १०६. ब्रह्माविष्णुशिवात्मिका १०७. त्रिकालज्ञानसम्पन्ना १०८. भुवनेश्वरी`,
    transliteration: `1. Prakritih 2. Vikritih 3. Vidya 4. Sarvabhutahitaprada 5. Shraddha 6. Vibhutih 7. Surabhih 8. Paramatmika 9. Vak 10. Padmalaya
11. Padma 12. Shuchih 13. Svaha 14. Svadha 15. Sudha 16. Dhanya 17. Hiranmayi 18. Lakshmi 19. Nityapushta 20. Vibhavari
21. Aditi 22. Diti 23. Dipta 24. Vasudha 25. Vasudharini 26. Kamala 27. Kanta 28. Kshama 29. Kshirodasambhava 30. Anugrahapara
31. Buddhih 32. Anagha 33. Harivallabha 34. Ashoka 35. Amrita 36. Dipta 37. Lokashokavinashini 38. Dharmanilaya 39. Karuna 40. Lokamata
41. Padmapriya 42. Padmahasta 43. Padmakshi 44. Padmasundari 45. Padmodbhava 46. Padmamukhi 47. Padmanabhapriya 48. Rama 49. Padmamaladhara 50. Devi
51. Padmini 52. Padmagandhini 53. Punyagandha 54. Suprasanna 55. Prasadabhimukhi 56. Prabha 57. Chandravadana 58. Chandra 59. Chandrasahodari 60. Chaturbhuja
61. Chandrarupa 62. Indira 63. Indushitala 64. Ahladajanani 65. Pushtih 66. Shiva 67. Shivakari 68. Sati 69. Vimala 70. Vishwajanani
71. Tushtih 72. Daridryanashini 73. Pritipushkarini 74. Shanta 75. Shuklamalyambara 76. Shrih 77. Bhaskari 78. Bilvanilaya 79. Vararoha 80. Yashasvini
81. Vasundhara 82. Udaranga 83. Harini 84. Hemamalini 85. Dhanadhanyakari 86. Siddhih 87. Strainasaumya 88. Shubhaprada 89. Nripaveshmagatananda 90. Varalakshmi
91. Vasuprada 92. Shubha 93. Hiranyaprakara 94. Samudratanaya 95. Jaya 96. Mangala Devi 97. Vishnuvakshahsthalasthita 98. Vishnupatni 99. Prasannakshi 100. Narayanasamashrita
101. Daridryadhvansini 102. Devi 103. Sarvopadravavarini 104. Navadurga 105. Mahakali 106. Brahmavishnushivatmika 107. Trikalajnanasampanna 108. Bhuvaneshwari.`,
    meaning: 'This is a list of 108 names of Goddess Lakshmi, describing her many forms and attributes — as the giver of prosperity, purity, fame, contentment (Tushti), forgiveness (Kshama) and auspiciousness — traditionally used for archana during Sri Sukta recitation.', meaningHi: 'यह देवी लक्ष्मी के 108 नामों की सूची है, जो उनके अनेक रूपों और गुणों का वर्णन करती है — समृद्धि, पवित्रता, यश, संतोष (तुष्टि), क्षमा और मंगलकारीता की दाता के रूप में — जिसे परंपरागत रूप से श्री सूक्त पाठ के दौरान अर्चना के लिए उपयोग किया जाता है।',
    benefits: 'Recited or used for Archana with lotus flowers on Fridays, during Diwali and Varalakshmi Vratam, invoking wealth, prosperity and well-being.', benefitsHi: 'शुक्रवार, दिवाली और वरलक्ष्मी व्रतम के दौरान कमल के फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो धन, समृद्धि और कल्याण का आह्वान करता है।',
  },
  {
    slug: 'saraswati-ashtottara-shatanamavali',
    title: 'Saraswati Ashtottara Shatanamavali',
    titleHi: 'सरस्वती अष्टोत्तरशतनामावली',
    deity: 'Saraswati', deityHi: 'माँ सरस्वती',
    icon: '📖',
    lyricsHi: `१. सरस्वती २. महाभद्रा ३. महामाया ४. वरप्रदा ५. श्रीप्रदा ६. पद्मनिलया ७. पद्माक्षी ८. पद्मवक्त्रका ९. शिवानुजा १०. पुस्तकभृतः
११. ज्ञानमुद्रा १२. रमा १३. परा १४. कामरूपा १५. महाविद्या १६. महापातकनाशिनी १७. महाश्रया १८. मालिनी १९. महाभोगा २०. महाभुजा
२१. महाभागा २२. महोत्साहा २३. दिव्याङ्गा २४. सुरवन्दिता २५. महाकाली २६. महापाशा २७. महाकारा २८. महाङ्कुशा २९. पीता ३०. विमला
३१. विश्वा ३२. विद्युन्माला ३३. वैष्णवी ३४. चन्द्रिका ३५. चन्द्रवदना ३६. चन्द्रलेखाविभूषिता ३७. सावित्री ३८. सुरसा ३९. देवी ४०. दिव्यालङ्कारभूषिता
४१. वाग्देवी ४२. वसुदा ४३. तीव्रा ४४. महाभद्रा ४५. महाबला ४६. भोगदा ४७. भारती ४८. भामा ४९. गोविन्दा ५०. गोमती
५१. शिवा ५२. जटिला ५३. विन्ध्यवासा ५४. विन्ध्याचलविराजिता ५५. चण्डिका ५६. वैष्णवी ५७. ब्राह्मी ५८. ब्रह्मज्ञानैकसाधना ५९. सौदामिनी ६०. सुधामूर्तिः
६१. सुभद्रा ६२. सुरपूजिता ६३. सुवासिनी ६४. सुनासा ६५. विनिद्रा ६६. पद्मलोचना ६७. विद्यारूपा ६८. विशालाक्षी ६९. ब्रह्मजाया ७०. महाफला
७१. त्रयीमूर्तिः ७२. त्रिकालज्ञा ७३. त्रिगुणा ७४. शास्त्ररूपिणी ७५. शुम्भासुरप्रमथिनी ७६. शुभदा ७७. स्वरात्मिका ७८. रक्तबीजनिहन्त्री ७९. चामुण्डा ८०. अम्बिका
८१. मुण्डकायप्रहरणा ८२. धूम्रलोचनमर्दना ८३. सर्वदेवस्तुता ८४. सौम्या ८५. सुरासुरनमस्कृता ८६. कालरात्री ८७. कलाधारा ८८. रूपसौभाग्यदायिनी ८९. वाग्देवी ९०. वरारोहा
९१. वाराही ९२. वारिजासना ९३. चित्राम्बरा ९४. चित्रगन्धा ९५. चित्रमाल्यविभूषिता ९६. कान्ता ९७. कामप्रदा ९८. वन्द्या ९९. विद्याधरसुपूजिता १००. श्वेतानना
१०१. नीलभुजा १०२. चतुर्वर्गफलप्रदा १०३. चतुराननसाम्राज्या १०४. रक्तमध्या १०५. निरञ्जना १०६. हंसासना १०७. नीलजङ्घा १०८. ब्रह्मविष्णुशिवात्मिका`,
    transliteration: `1. Saraswati 2. Mahabhadra 3. Mahamaya 4. Varaprada 5. Shriprada 6. Padmanilaya 7. Padmakshi 8. Padmavaktraka 9. Shivanuja 10. Pustakabhritah
11. Jnanamudra 12. Rama 13. Para 14. Kamarupa 15. Mahavidya 16. Mahapatakanashini 17. Mahashraya 18. Malini 19. Mahabhoga 20. Mahabhuja
21. Mahabhaga 22. Mahotsaha 23. Divyanga 24. Suravandita 25. Mahakali 26. Mahapasha 27. Mahakara 28. Mahankusha 29. Pita 30. Vimala
31. Vishwa 32. Vidyunmala 33. Vaishnavi 34. Chandrika 35. Chandravadana 36. Chandralekhavibhushita 37. Savitri 38. Surasa 39. Devi 40. Divyalankarabhushita
41. Vagdevi 42. Vasuda 43. Tivra 44. Mahabhadra 45. Mahabala 46. Bhogada 47. Bharati 48. Bhama 49. Govinda 50. Gomati
51. Shiva 52. Jatila 53. Vindhyavasa 54. Vindhyachalavirajita 55. Chandika 56. Vaishnavi 57. Brahmi 58. Brahmajnanaikasadhana 59. Saudamini 60. Sudhamurtih
61. Subhadra 62. Surapujita 63. Suvasini 64. Sunasa 65. Vinidra 66. Padmalochana 67. Vidyarupa 68. Vishalakshi 69. Brahmajaya 70. Mahaphala
71. Trayimurtih 72. Trikalajna 73. Triguna 74. Shastrarupini 75. Shumbhasurapramathini 76. Shubhada 77. Svaratmika 78. Raktabijanihantri 79. Chamunda 80. Ambika
81. Mundakayapraharana 82. Dhumralochanamardana 83. Sarvadevastuta 84. Saumya 85. Surasuranamaskrita 86. Kalaratri 87. Kaladhara 88. Rupasaubhagyadayini 89. Vagdevi 90. Vararoha
91. Varahi 92. Varijasana 93. Chitrambara 94. Chitragandha 95. Chitramalyavibhushita 96. Kanta 97. Kamaprada 98. Vandya 99. Vidyadharasupujita 100. Shvetanana
101. Nilabhuja 102. Chaturvargaphalaprada 103. Chaturananasamrajya 104. Raktamadhya 105. Niranjana 106. Hansasana 107. Nilajangha 108. Brahmavishnushivatmika.`,
    meaning: 'This is a list of 108 names of Goddess Saraswati, describing her as the mother of the Vedas (Vedamata), giver of speech (Vagdevi), and embodiment of knowledge, music and the arts in her many forms.', meaningHi: 'यह देवी सरस्वती के 108 नामों की सूची है, जो उन्हें वेदों की माता (वेदमाता), वाणी की दाता (वाग्देवी), और अपने अनेक रूपों में ज्ञान, संगीत तथा कला के अवतार के रूप में वर्णित करती है।',
    benefits: 'Recited or used for Archana with white flowers during Basant Panchami and Navratri, and by students seeking clarity of intellect and academic success.', benefitsHi: 'बसंत पंचमी और नवरात्रि के दौरान श्वेत फूलों से अर्चना के लिए, तथा बुद्धि की स्पष्टता और शैक्षणिक सफलता चाहने वाले विद्यार्थियों द्वारा पाठ या उपयोग किया जाता है।',
  },
  {
    slug: 'krishna-ashtottara-shatanamavali',
    title: 'Krishna Ashtottara Shatanamavali',
    titleHi: 'कृष्ण अष्टोत्तरशतनामावली',
    deity: 'Krishna', deityHi: 'भगवान श्रीकृष्ण',
    icon: '🪈',
    lyricsHi: `१. श्री कृष्णः २. कमलानाथः ३. वासुदेवः ४. सनातनः ५. वसुदेवात्मजः ६. पुण्यः ७. लीलामानुषविग्रहः ८. श्रीवत्सकौस्तुभधरः ९. यशोदावत्सलः १०. हरिः
११. चतुर्भुजात्तचक्रासिगदाशङ्खाद्यायुधः १२. देवकीनन्दनः १३. श्रीशः १४. नन्दगोपप्रियात्मजः १५. यमुनावेगसंहारी १६. बलभद्रप्रियानुजः १७. पूतनाजीवितहरः १८. शकटासुरभञ्जनः १९. नन्दव्रजजनानन्दी २०. सच्चिदानन्दविग्रहः
२१. नवनीतविलिप्ताङ्गः २२. नवनीतनटः २३. अनघः २४. नवनीतनवाहारी २५. मुचुकुन्दप्रसादकः २६. षोडशस्त्रीसहस्रेशः २७. त्रिभङ्गी २८. मधुराकृतिः २९. शुकवागमृताब्धीन्दुः ३०. गोविन्दः
३१. योगिनाम्पतिः ३२. वत्सवाटचरः ३३. अनन्तः ३४. धेनुकासुरभञ्जनः ३५. तृणीकृततृणावर्तः ३६. यमलार्जुनभञ्जनः ३७. उत्तालतालभेता ३८. गोपगोपीश्वरः ३९. योगी ४०. कोटिसूर्यसमप्रभः
४१. इलापतिः ४२. परञ्ज्योतिषः ४३. यादवेन्द्रः ४४. यदूद्वहः ४५. वनमाली ४६. पीतवासी ४७. पारिजातापहारकः ४८. गोवर्धनाचलोद्धर्ता ४९. गोपालः ५०. सर्वपालकः
५१. अजः ५२. निरञ्जनः ५३. कामजनकः ५४. कञ्जलोचनः ५५. मधुघ्नः ५६. मधुरानाथः ५७. द्वारकानायकः ५८. बली ५९. बृन्दावनान्तसञ्चारी ६०. तुलसीदामभूषणः
६१. स्यमन्तकमणिहर्ता ६२. नरनारायणात्मकः ६३. कुब्जाकृष्णाम्बरधरः ६४. मायी ६५. परमपूरुषः ६६. मुष्टिकासुरचाणूरमल्लयुद्धविशारदः ६७. संसारवैरी ६८. कंसारिः ६९. मुरारिः ७०. नरकान्तकः
७१. अनादिब्रह्मचारी ७२. कृष्णाव्यसनकर्षकः ७३. शिशुपालशिरच्छेता ७४. दुर्योधनकुलान्तकः ७५. विदुराक्रूरवरदः ७६. विश्वरूपप्रदर्शकः ७७. सत्यवाचः ७८. सत्यसङ्कल्पः ७९. सत्यभामारतः ८०. जयी
८१. सुभद्रापूर्वजः ८२. जिष्णुः ८३. भीष्ममुक्तिप्रदायकः ८४. जगद्गुरुः ८५. जगन्नाथः ८६. वेणुनादविशारदः ८७. वृषभासुरविध्वंसी ८८. बाणासुरकरान्तकः ८९. युधिष्ठिरप्रतिष्ठाता ९०. बर्हिबर्हावतंसकः
९१. पार्थसारथिः ९२. अव्यक्तः ९३. गीतामृतमहोदधिः ९४. कालीयफणिमाणिक्यरञ्जितश्रीपदाम्बुजः ९५. दामोदरः ९६. यज्ञभोक्ता ९७. दानवेन्द्रविनाशकः ९८. नारायणः ९९. परब्रह्म १००. पन्नगाशनवाहनः
१०१. जलक्रीडासमासक्तगोपीवस्त्रापहारकः १०२. पुण्यश्लोकः १०३. तीर्थपादः १०४. वेदवेद्यः १०५. दयानिधिः १०६. सर्वतीर्थात्मकः १०७. सर्वग्रहरूपी १०८. परात्परः`,
    transliteration: `1. Shri Krishnah 2. Kamalanathah 3. Vasudevah 4. Sanatanah 5. Vasudevatmajah 6. Punyah 7. Lilamanushavigrahah 8. Shrivatsakaustubhadharah 9. Yashodavatsalah 10. Harih
11. Chaturbhujattachakrasigadashankhadyayudhah 12. Devakinandanah 13. Shrishah 14. Nandagopapriyatmajah 15. Yamunavegasanhari 16. Balabhadrapriyanujah 17. Putanajivitaharah 18. Shakatasurabhanjanah 19. Nandavrajajanandi 20. Sacchidanandavigrahah
21. Navanitaviliptangah 22. Navanitanatah 23. Anaghah 24. Navanitanavahari 25. Muchukundaprasadakah 26. Shodashastrisahasreshah 27. Tribhangi 28. Madhurakritih 29. Shukavagamritabdhindu 30. Govindah
31. Yoginampatih 32. Vatsavatacharah 33. Anantah 34. Dhenukasurabhanjanah 35. Trinikritatrinavartah 36. Yamalarjunabhanjanah 37. Uttalatalabheta 38. Gopagopishwarah 39. Yogi 40. Kotisuryasamaprabhah
41. Ilapatih 42. Paranjyotishah 43. Yadavendrah 44. Yadudvahah 45. Vanamali 46. Pitavasi 47. Parijatapaharakah 48. Govardhanachaloddharta 49. Gopalah 50. Sarvapalakah
51. Ajah 52. Niranjanah 53. Kamajanakah 54. Kanjalochanah 55. Madhughnah 56. Madhuranathah 57. Dvarakanayakah 58. Bali 59. Brindavanantasanchari 60. Tulasidamabhushanah
61. Syamantakamaniharta 62. Naranarayanatmakah 63. Kubjakrishnambaradharah 64. Mayi 65. Paramapurushah 66. Mushtikasurachanuramallayuddhavisharadah 67. Sansaravairi 68. Kansarih 69. Murarih 70. Narakantakah
71. Anadibrahmachari 72. Krishnavyasanakarshakah 73. Shishupalashirachchheta 74. Duryodhanakulantakah 75. Vidurakruraravaradah 76. Vishwarupapradarshakah 77. Satyavachah 78. Satyasankalpah 79. Satyabhamaratah 80. Jayi
81. Subhadrapurvajah 82. Jishnuh 83. Bhishmamuktipradayakah 84. Jagadguruh 85. Jagannathah 86. Venunadavisharadah 87. Vrishabhasuravidhvansi 88. Banasurakarantakah 89. Yudhishthirapratishthata 90. Barhibarhavatansakah
91. Parthasarathih 92. Avyaktah 93. Gitamritamahodadhih 94. Kaliyaphanimanikyaranjitashripadambujah 95. Damodarah 96. Yajnabhokta 97. Danavendravinashakah 98. Narayanah 99. Parabrahma 100. Pannagashanavahanah
101. Jalakridasamasaktagopivastrapaharakah 102. Punyashlokah 103. Tirthapadah 104. Vedavedyah 105. Dayanidhih 106. Sarvatirthatmakah 107. Sarvagraharupi 108. Paratparah.`,
    meaning: 'This is a list of 108 names of Lord Krishna, describing his childhood pastimes in Vrindavan, his role in the Mahabharata, his relationship with the Gopis and Radha, and his identity as the Supreme Being (Parabrahma) who imparted the Bhagavad Gita.', meaningHi: 'यह भगवान कृष्ण के 108 नामों की सूची है, जो वृंदावन में उनकी बाल-लीलाओं, महाभारत में उनकी भूमिका, गोपियों और राधा के साथ उनके संबंध, तथा भगवद्गीता का उपदेश देने वाले परब्रह्म के रूप में उनकी पहचान का वर्णन करती है।',
    benefits: 'Recited or used for Archana with tulsi (basil) leaves during Janmashtami and Wednesdays, cultivating devotional love (bhakti) for Krishna.', benefitsHi: 'जन्माष्टमी और बुधवार के दिन तुलसी पत्तों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो कृष्ण के प्रति भक्ति-प्रेम (भक्ति) को विकसित करता है।',
  },
  {
    slug: 'rama-ashtottara-shatanamavali',
    title: 'Rama Ashtottara Shatanamavali',
    titleHi: 'राम अष्टोत्तरशतनामावली',
    deity: 'Rama', deityHi: 'भगवान श्रीराम',
    icon: '🏹',
    lyricsHi: `१. श्रीरामः २. रामभद्रः ३. रामचन्द्रः ४. शाश्वतः ५. राजीवलोचनः ६. श्रीमान् ७. राजेन्द्रः ८. रघुपुङ्गवः ९. जानकीवल्लभः १०. जैत्रः
११. जितामित्रः १२. जनार्दनः १३. विश्वामित्रप्रियः १४. दान्तः १५. शरणत्राणतत्परः १६. वालिप्रमथनः १७. वाग्मी १८. सत्यवाचः १९. सत्यविक्रमः २०. सत्यव्रतः
२१. व्रतधरः २२. सदा हनुमदाश्रितः २३. कौसलेयः २४. खरध्वंसी २५. विराधवधपण्डितः २६. विभीषणपरित्राता २७. हरकोदण्डखण्डनः २८. सप्ततालप्रभेत्ता २९. दशग्रीवशिरोहरः ३०. जामदग्न्यमहादर्पदलनः
३१. ताटकान्तकः ३२. वेदान्तसारः ३३. वेदात्मा ३४. भवरोगस्य भेषजम् ३५. दूषणत्रिशिरोहन्ता ३६. त्रिमूर्तिः ३७. त्रिगुणात्मकः ३८. त्रिविक्रमः ३९. त्रिलोकात्मा ४०. पुण्यचारित्रकीर्तनः
४१. त्रिलोकरक्षकः ४२. धन्वी ४३. दण्डकारण्यकर्तनः ४४. अहल्याशापशमनः ४५. पितृभक्तः ४६. वरप्रदः ४७. जितेन्द्रियः ४८. जितक्रोधः ४९. जितामित्रः ५०. जगद्गुरुः
५१. ऋक्षवानरसङ्घाती ५२. चित्रकूटसमाश्रयः ५३. जयन्तत्राणवरदः ५४. सुमित्रापुत्रसेवितः ५५. सर्वदेवाधिदेवः ५६. मृतवानरजीवनः ५७. मायामारीचहन्ता ५८. महादेवः ५९. महाभुजः ६०. सर्वदेवस्तुतः
६१. सौम्यः ६२. ब्रह्मण्यः ६३. मुनिसंस्तुतः ६४. महायोगी ६५. महोदारः ६६. सुग्रीवेप्सितराज्यदः ६७. सर्वपुण्याधिकफलः ६८. स्मृतसर्वाघनाशनः ६९. आदिपुरुषः ७०. परमपुरुषः
७१. महापुरुषः ७२. पुण्योदयः ७३. दयासारः ७४. पुराणपुरुषोत्तमः ७५. स्मितवक्त्रः ७६. मितभाषी ७७. पूर्वभाषी ७८. राघवः ७९. अनन्तगुणगम्भीरः ८०. धीरोदात्तगुणोत्तमः
८१. मायामानुषचारित्रः ८२. महादेवादिपूजितः ८३. सेतुकृतः ८४. जितवाराशिः ८५. सर्वतीर्थमयः ८६. हरिः ८७. श्यामाङ्गः ८८. सुन्दरः ८९. शूरः ९०. पीतवाससः
९१. धनुर्धरः ९२. सर्वयज्ञाधिपः ९३. यज्वी ९४. जरामरणवर्जितः ९५. विभीषणप्रतिष्ठाता ९६. सर्वावगुणवर्जितः ९७. परमात्मा ९८. परं ब्रह्म ९९. सच्चिदानन्दविग्रहः १००. परं ज्योतिः
१०१. परं धाम १०२. पराकाशः १०३. परात्परः १०४. परेशः १०५. पारगः १०६. पारः १०७. सर्वदेवात्मकः १०८. परम्`,
    transliteration: `1. Shri Ramah 2. Ramabhadrah 3. Ramachandrah 4. Shashwatah 5. Rajivalochanah 6. Shriman 7. Rajendrah 8. Raghupungavah 9. Janakivallabhah 10. Jaitrah
11. Jitamitrah 12. Janardanah 13. Vishwamitrapriyah 14. Dantah 15. Sharanatranatatparah 16. Valipramathanah 17. Vagmi 18. Satyavachah 19. Satyavikramah 20. Satyavratah
21. Vratadharah 22. Sada Hanumadashritah 23. Kausaleyah 24. Kharadhvansi 25. Viradhavadhapanditah 26. Vibhishanaparitrata 27. Harakodandakhandanah 28. Saptatalaprabhetta 29. Dashagrivashiroharah 30. Jamadagnyamahadarpadalanah
31. Tatakantakah 32. Vedantasarah 33. Vedatma 34. Bhavarogasya Bheshajam 35. Dushanatrishirohanta 36. Trimurtih 37. Trigunatmakah 38. Trivikramah 39. Trilokatma 40. Punyacharitrakirtanah
41. Trilokarakshakah 42. Dhanvi 43. Dandakaranyakartanah 44. Ahalyashapashamanah 45. Pitribhaktah 46. Varapradah 47. Jitendriyah 48. Jitakrodhah 49. Jitamitrah 50. Jagadguruh
51. Rikshavanarasanghati 52. Chitrakutasamashrayah 53. Jayantatranavaradah 54. Sumitraputrasevitah 55. Sarvadevadhidevah 56. Mritavanarajivanah 57. Mayamarichahanta 58. Mahadevah 59. Mahabhujah 60. Sarvadevastutah
61. Saumyah 62. Brahmanyah 63. Munisanstutah 64. Mahayogi 65. Mahodarah 66. Sugrivepsitarajyadah 67. Sarvapunyadhikaphalah 68. Smritasarvaghanashanah 69. Adipurushah 70. Paramapurushah
71. Mahapurushah 72. Punyodayah 73. Dayasarah 74. Puranapurushottamah 75. Smitavaktrah 76. Mitabhashi 77. Purvabhashi 78. Raghavah 79. Anantagunagambhirah 80. Dhirodattagunottamah
81. Mayamanushacharitrah 82. Mahadevadipujitah 83. Setukritah 84. Jitavarashih 85. Sarvatirthamayah 86. Harih 87. Shyamangah 88. Sundarah 89. Shurah 90. Pitavasasah
91. Dhanurdharah 92. Sarvayajnadhipah 93. Yajvi 94. Jaramaranavarjitah 95. Vibhishanapratishthata 96. Sarvavagunavarjitah 97. Paramatma 98. Param Brahma 99. Sacchidanandavigrahah 100. Param Jyotih
101. Param Dhama 102. Parakashah 103. Paratparah 104. Pareshah 105. Paragah 106. Parah 107. Sarvadevatmakah 108. Param.`,
    meaning: 'This is a list of 108 names of Lord Rama, describing his birth as the ideal king (Maryada Purushottam), his exile, his alliance with Hanuman and Sugriva, his war with Ravana, and his role as the seventh avatar of Vishnu.', meaningHi: 'यह भगवान राम के 108 नामों की सूची है, जो आदर्श राजा (मर्यादा पुरुषोत्तम) के रूप में उनके जन्म, उनके वनवास, हनुमान और सुग्रीव के साथ उनके गठबंधन, रावण के साथ उनके युद्ध, और विष्णु के सातवें अवतार के रूप में उनकी भूमिका का वर्णन करती है।',
    benefits: 'Recited or used for Archana with lotus or tulsi during Ram Navami and daily prayer, invoking righteousness, courage and devotion.', benefitsHi: 'राम नवमी और दैनिक प्रार्थना के दौरान कमल या तुलसी से अर्चना के लिए पाठ या उपयोग किया जाता है, जो धार्मिकता, साहस और भक्ति का आह्वान करता है।',
  },
  {
    slug: 'hanuman-ashtottara-shatanamavali',
    title: 'Hanuman Ashtottara Shatanamavali',
    titleHi: 'हनुमान अष्टोत्तरशतनामावली',
    deity: 'Hanuman', deityHi: 'श्री हनुमान जी',
    icon: '🐒',
    lyricsHi: `१. हनुमान् २. अञ्जनापुत्रः ३. वायुसूनुः ४. महाबलः ५. रामदूतः ६. हरिश्रेष्ठः ७. सूरी ८. केसरिनन्दनः ९. सूर्यश्रेष्ठः १०. महाकायः
११. वज्री १२. वज्रप्रहारवान् १३. महासत्त्वः १४. महारूपः १५. ब्रह्मण्यः १६. ब्राह्मणप्रियः १७. मुख्यप्राणः १८. महाभीमः १९. पूर्णप्रज्ञः २०. महागुरुः
२१. ब्रह्मचारी २२. वृक्षधरः २३. पुण्यः २४. श्रीरामकिङ्करः २५. सीताशोकविनाशी २६. सिंहिकाप्राणनाशकः २७. मैनाकगर्वभङ्गः २८. छायाग्रहनिवारकः २९. लङ्कामोक्षप्रदः ३०. देवः
३१. सीतामार्गणतत्परः ३२. रामाङ्गुलिप्रदाता ३३. सीताहर्षविवर्धनः ३४. महारूपधरः ३५. दिव्यः ३६. अशोकवननाशकः ३७. मन्त्रिपुत्रहरः ३८. वीरः ३९. पञ्चसेनाग्रमर्दनः ४०. दशकण्ठसुतघ्नः
४१. ब्रह्मास्त्रवशगः ४२. अव्ययः ४३. दशास्यसल्लापपरः ४४. लङ्कापुरविदाहकः ४५. तीर्णाब्धिः ४६. कपिराजः ४७. कपियूथप्ररञ्जकः ४८. चूडामणिप्रदाता ४९. श्रीवश्यः ५०. प्रियदर्शकः
५१. कौपीनकुण्डलधरः ५२. कनकाङ्गदभूषणः ५३. सर्वशास्त्रसुसम्पन्नः ५४. सर्वज्ञः ५५. ज्ञानदोत्तमः ५६. मुख्यप्राणः ५७. महावेगः ५८. शब्दशास्त्रविशारदः ५९. बुद्धिमान् ६०. सर्वलोकेशः
६१. सुरेशः ६२. लोकरञ्जकः ६३. लोकनाथः ६४. महादर्पः ६५. सर्वभूतभयापहः ६६. रामवाहनरूपः ६७. सञ्जीवाचलभेदकः ६८. कपीनां प्राणदाता ६९. लक्ष्मणप्राणरक्षकः ७०. रामपादसमीपस्थः
७१. लोहितास्यः ७२. महाहनुः ७३. रामसन्देशकर्ता ७४. भरतानन्दवर्धनः ७५. रामाभिषेकलोलः ७६. रामकार्यधुरन्धरः ७७. कुन्तीगर्भसमुत्पन्नः ७८. भीमः ७९. भीमपराक्रमः ८०. लाक्षागृहाद्विनिर्मुक्तः
८१. हिडिम्बासुरमर्दनः ८२. धर्मानुजः ८३. पाण्डुपुत्रः ८४. धनञ्जयसहायवान् ८५. बलासुरवधोद्युक्तः ८६. तद्ग्रामपरिरक्षकः ८७. नित्यं भिक्षाहाररतः ८८. कुलालगृहमध्यगः ८९. पाञ्चाल्युद्वाहसञ्जातसम्मोदः ९०. बहुकान्तिमान्
९१. विराटनगरे गूढचरः ९२. कीचकमर्दनः ९३. दुर्योधननिहन्ता ९४. जरासन्धविमर्दनः ९५. सौगन्धिकापहर्ता ९६. द्रौपदीप्राणवल्लभः ९७. पूर्णबोधः ९८. व्यासशिष्यः ९९. यतिरूपः १००. महामतिः
१०१. दुर्वादिगजसिंहस्य तर्कशास्त्रस्य खण्डनः १०२. बौद्धागमविभेत्ता १०३. साङ्ख्यशास्त्रस्य दूषकः १०४. द्वैतशास्त्रप्रणेता १०५. वेदव्यासमतानुगः १०६. पूर्णानन्दः १०७. पूर्णसत्वः १०८. पूर्णवैराग्यसागरः`,
    transliteration: `1. Hanuman 2. Anjanaputrah 3. Vayusunuh 4. Mahabalah 5. Ramadutah 6. Harishreshthah 7. Suri 8. Kesarinandanah 9. Suryashreshthah 10. Mahakayah
11. Vajri 12. Vajrapraharavan 13. Mahasattvah 14. Maharupah 15. Brahmanyah 16. Brahmanapriyah 17. Mukhyapranah 18. Mahabhimah 19. Purnaprajnah 20. Mahaguruh
21. Brahmachari 22. Vrikshadharah 23. Punyah 24. Shriramakinkarah 25. Sitashokavinashi 26. Simhikapranashakah 27. Mainakagarvabhangah 28. Chhayagrahanivarakah 29. Lankamokshapradah 30. Devah
31. Sitamarganatatparah 32. Ramangulipradata 33. Sitaharshavivardhanah 34. Maharupadharah 35. Divyah 36. Ashokavananashakah 37. Mantriputraharah 38. Virah 39. Panchasenagramardanah 40. Dashakanthasutaghnah
41. Brahmastravashagah 42. Avyayah 43. Dashasyasallaparah 44. Lankapuravidahakah 45. Tirnabdhih 46. Kapirajah 47. Kapiyuthapraranjakah 48. Chudamanipradata 49. Shrivashyah 50. Priyadarshakah
51. Kaupinakundaladharah 52. Kanakangadabhushanah 53. Sarvashastrasusampannah 54. Sarvajnah 55. Jnanadottamah 56. Mukhyapranah 57. Mahavegah 58. Shabdashastravisharadah 59. Buddhiman 60. Sarvalokeshah
61. Sureshah 62. Lokaranjakah 63. Lokanathah 64. Mahadarpah 65. Sarvabhutabhayapahah 66. Ramavahanarupah 67. Sanjivachalabhedakah 68. Kapinam Pranadata 69. Lakshmanapranarakshakah 70. Ramapadasamipasthah
71. Lohitasyah 72. Mahahanuh 73. Ramasandeshakarta 74. Bharatanandavardhanah 75. Ramabhishekalolah 76. Ramakaryadhurandharah 77. Kuntigarbhasamutpannah 78. Bhimah 79. Bhimaparakramah 80. Lakshagrihadvinirmuktah
81. Hidimbasuramardanah 82. Dharmanujah 83. Panduputrah 84. Dhananjayasahayavan 85. Balasuravadhodyuktah 86. Tadgramaparirakshakah 87. Nityam Bhikshahararatah 88. Kulalagrihamadhyagah 89. Panchalyudvahasanjatasammodah 90. Bahukantiman
91. Viratanagare Gudhacharah 92. Kichakamardanah 93. Duryodhananihanta 94. Jarasandhavimardanah 95. Saugandhikapaharta 96. Draupadipranavallabhah 97. Purnabodhah 98. Vyasashishyah 99. Yatirupah 100. Mahamatih
101. Durvadigajasinhasya Tarkashastrasya Khandanah 102. Bauddhagamavibhetta 103. Sankhyashastrasya Dushakah 104. Dvaitashastrapraneta 105. Vedavyasamatanugah 106. Purnanandah 107. Purnasatvah 108. Purnavairagyasagarah.`,
    meaning: 'This is a list of 108 names of Hanuman, describing his birth, strength, devotion to Rama, his crossing of the ocean, and his role as Sankatmochan (remover of troubles) and eternal (Chiranjeevi) protector of devotees. It follows the Madhva (Dvaita) tradition, which venerates Hanuman as Mukhyaprana — the chief form of Vayu — and counts Bhima and Madhvacharya among his later incarnations; that is why names 77 onward draw on the Mahabharata and on Vedanta rather than the Ramayana alone. A separate and more widely recited Anjaneya Ashtottara keeps to the Ramayana only. Note that the received text names Mukhyaprana twice, at 17 and 56, so the 108 numbered positions carry 107 distinct names. That repetition is in the source stotram itself and is reproduced here as it stands rather than being quietly altered.', meaningHi: 'यह हनुमान जी के 108 नामों की सूची है, जो उनके जन्म, शक्ति, राम के प्रति भक्ति, समुद्र पार करने, और संकटमोचन तथा भक्तों के चिरंजीवी रक्षक के रूप में उनकी भूमिका का वर्णन करती है। यह सूची माध्व (द्वैत) परंपरा की है, जिसमें हनुमान जी को मुख्यप्राण — वायु का प्रमुख रूप — माना जाता है तथा भीम और मध्वाचार्य को उनके परवर्ती अवतार माना जाता है; इसी कारण 77 से आगे के नाम केवल रामायण नहीं, अपितु महाभारत और वेदांत से भी लिए गए हैं। इससे भिन्न, अधिक प्रचलित आञ्जनेय अष्टोत्तर केवल रामायण पर आधारित है। ध्यान दें कि मूल पाठ में मुख्यप्राणः नाम दो बार आता है — 17 और 56 पर — अतः 108 क्रमांकों में 107 भिन्न नाम हैं। यह पुनरावृत्ति मूल स्तोत्र में ही है और इसे यहाँ यथावत् रखा गया है।',
    benefits: 'Recited or used for Archana with sindoor or red flowers on Tuesdays and Saturdays, invoking courage, protection and freedom from fear.', benefitsHi: 'मंगलवार और शनिवार के दिन सिंदूर या लाल फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो साहस, सुरक्षा और भय से मुक्ति का आह्वान करता है।',
  },
  {
    slug: 'surya-ashtottara-shatanamavali',
    title: 'Surya Ashtottara Shatanamavali',
    titleHi: 'सूर्य अष्टोत्तरशतनामावली',
    deity: 'Surya', deityHi: 'सूर्य देव',
    icon: '☀️',
    lyricsHi: `१. अरुणः २. शरण्यः ३. करुणारससिन्धुः ४. असमानबलः ५. आर्तरक्षकः ६. आदित्यः ७. आदिभूतः ८. अखिलागमवेदी ९. अच्युतः १०. अखिलज्ञः
११. अनन्तः १२. इनः १३. विश्वरूपः १४. इज्यः १५. इन्द्रः १६. भानुः १७. इन्दिरामन्दिराप्तः १८. वन्दनीयः १९. ईशः २०. सुप्रसन्नः
२१. सुशीलः २२. सुवर्चसः २३. वसुप्रदः २४. वसुः २५. वासुदेवः २६. उज्ज्वलः २७. उग्ररूपः २८. ऊर्ध्वगः २९. विवस्वान् ३०. उद्यत्किरणजालः
३१. हृषीकेशः ३२. ऊर्जस्वलः ३३. वीरः ३४. निर्जरः ३५. जयः ३६. ऊरुद्वयाभावरूपयुक्तसारथिः ३७. ऋषिवन्द्यः ३८. रुग्घन्ता ३९. ऋक्षचक्रचरः ४०. ऋजुस्वभावचित्तः
४१. नित्यस्तुत्यः ४२. ॠकारमातृकावर्णरूपः ४३. उज्ज्वलतेजसः ४४. ॠक्षाधिनाथमित्रः ४५. पुष्कराक्षः ४६. लुप्तदन्तः ४७. शान्तः ४८. कान्तिदः ४९. घनः ५०. कनत्कनकभूषः
५१. खद्योतः ५२. लूनिताखिलदैत्यः ५३. सत्यानन्दस्वरूपी ५४. अपवर्गप्रदः ५५. आर्तशरण्यः ५६. एकाकी ५७. भगवान् ५८. सृष्टिस्थित्यन्तकारी ५९. गुणात्मा ६०. घृणिभृतः
६१. बृहतः ६२. ब्रह्म ६३. ऐश्वर्यदः ६४. शर्वः ६५. हरिदश्वः ६६. शौरिः ६७. दशदिक्सम्प्रकाशः ६८. भक्तवश्यः ६९. ओजस्करः ७०. जयी
७१. जगदानन्दहेतुः ७२. जन्ममृत्युजराव्याधिवर्जितः ७३. औच्च्यस्थानसमारूढरथस्थः ७४. असुरारिः ७५. कमनीयकरः ७६. अब्जवल्लभः ७७. अन्तर्बहिः प्रकाशः ७८. अचिन्त्यः ७९. आत्मरूपी ८०. अच्युतः
८१. अमरेशः ८२. परं ज्योतिः ८३. अहस्करः ८४. रविः ८५. हरिः ८६. परमात्मा ८७. तरुणः ८८. वरेण्यः ८९. ग्रहाणां पतिः ९०. भास्करः
९१. आदिमध्यान्तरहितः ९२. सौख्यप्रदः ९३. सकलजगतां पतिः ९४. सूर्यः ९५. कविः ९६. नारायणः ९७. परेशः ९८. तेजोरूपः ९९. श्रीं हिरण्यगर्भः १००. ह्रीं सम्पत्करः
१०१. ऐं इष्टार्थदः १०२. अनुप्रसन्नः १०३. श्रीमान् १०४. श्रेयसः १०५. भक्तकोटिसौख्यप्रदायी १०६. निखिलागमवेद्यः १०७. नित्यानन्दः १०८. श्री सूर्य नारायणः`,
    transliteration: `1. Arunah 2. Sharanyah 3. Karunarasasindhuh 4. Asamanabalah 5. Artarakshakah 6. Adityah 7. Adibhutah 8. Akhilagamavedi 9. Achyutah 10. Akhilajnah
11. Anantah 12. Inah 13. Vishwarupah 14. Ijyah 15. Indrah 16. Bhanuh 17. Indiramandiraptah 18. Vandaniyah 19. Ishah 20. Suprasannah
21. Sushilah 22. Suvarchasah 23. Vasupradah 24. Vasuh 25. Vasudevah 26. Ujjwalah 27. Ugrarupah 28. Urdhvagah 29. Vivasvan 30. Udyatkiranajalah
31. Hrishikeshah 32. Urjasvalah 33. Virah 34. Nirjarah 35. Jayah 36. Urudvayabhavarupayuktasarathih 37. Rishivandyah 38. Rugghanta 39. Rikshachakracharah 40. Rijusvabhavachittah
41. Nityastutyah 42. Rrikaramatrikavarnarupah 43. Ujjwalatejasah 44. Rrikshadhinathamitrah 45. Pushkarakshah 46. Luptadantah 47. Shantah 48. Kantidah 49. Ghanah 50. Kanatkanakabhushah
51. Khadyotah 52. Lunitakhiladaityah 53. Satyanandasvarupi 54. Apavargapradah 55. Artasharanyah 56. Ekaki 57. Bhagavan 58. Srishtisthityantakari 59. Gunatma 60. Ghrinibhritah
61. Brihatah 62. Brahma 63. Aishvaryadah 64. Sharvah 65. Haridashvah 66. Shaurih 67. Dashadiksamprakashah 68. Bhaktavashyah 69. Ojaskarah 70. Jayi
71. Jagadanandahetuh 72. Janmamrityujaravyadhivarjitah 73. Auchchyasthanasamarudharathasthah 74. Asurarih 75. Kamaniyakarah 76. Abjavallabhah 77. Antarbahih Prakashah 78. Achintyah 79. Atmarupi 80. Achyutah
81. Amareshah 82. Param Jyotih 83. Ahaskarah 84. Ravih 85. Harih 86. Paramatma 87. Tarunah 88. Varenyah 89. Grahanam Patih 90. Bhaskarah
91. Adimadhyantarahitah 92. Saukhyapradah 93. Sakalajagatam Patih 94. Suryah 95. Kavih 96. Narayanah 97. Pareshah 98. Tejorupah 99. Shrim Hiranyagarbhah 100. Hrim Sampatkarah
101. Aim Ishtarthadah 102. Anuprasannah 103. Shriman 104. Shreyasah 105. Bhaktakotisaukhyapradayi 106. Nikhilagamavedyah 107. Nityanandah 108. Shri Surya Narayanah.`,
    meaning: 'This is a list of 108 names of Surya, the Sun God, describing his twelve principal forms (the Dvadasha Adityas embedded within the list — Mitra, Ravi, Surya, Bhanu and others) and his role as source of light, health and the cycle of time.', meaningHi: 'यह सूर्य देव के 108 नामों की सूची है, जो उनके बारह प्रमुख रूपों (सूची में सम्मिलित द्वादश आदित्य — मित्र, रवि, सूर्य, भानु और अन्य) तथा प्रकाश, स्वास्थ्य और काल-चक्र के स्रोत के रूप में उनकी भूमिका का वर्णन करती है।',
    benefits: 'Recited or used for Archana with red flowers at sunrise, during Chhath Puja and Ratha Saptami, invoking health, vitality and success.', benefitsHi: 'सूर्योदय के समय, छठ पूजा और रथ सप्तमी के दौरान लाल फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो स्वास्थ्य, ऊर्जा और सफलता का आह्वान करता है।',
  },
  {
    slug: 'shani-ashtottara-shatanamavali',
    title: 'Shani Ashtottara Shatanamavali',
    titleHi: 'शनि अष्टोत्तरशतनामावली',
    deity: 'Shani', deityHi: 'शनि देव',
    icon: '🪐',
    lyricsHi: `१. शनैश्चरः २. शान्तः ३. सर्वाभीष्टप्रदायी ४. शरण्यः ५. वरेण्यः ६. सर्वेशः ७. सौम्यः ८. सुरवन्द्यः ९. सुरलोकविहारी १०. सुखासनोपविष्टः
११. सुन्दरः १२. घनः १३. घनरूपः १४. घनाभरणधारी १५. घनसारविलेपः १६. खद्योतः १७. मन्दः १८. मन्दचेष्टः १९. महनीयगुणात्मा २०. मर्त्यपावनपादः
२१. महेशः २२. छायापुत्रः २३. शर्वः २४. शरतूणीरधारी २५. चरस्थिरस्वभावः २६. चञ्चलः २७. नीलवर्णः २८. नित्यः २९. नीलाञ्जननिभः ३०. नीलाम्बरविभूषः
३१. निश्चलः ३२. वेद्यः ३३. विधिरूपः ३४. विरोधाधारभूमिः ३५. भेदास्पदस्वभावः ३६. वज्रदेहः ३७. वैराग्यदः ३८. वीरः ३९. वीतरोगभयः ४०. विपत्परम्परेशः
४१. विश्ववन्द्यः ४२. गृध्नवाहः ४३. गूढः ४४. कूर्माङ्गः ४५. कुरूपी ४६. कुत्सितः ४७. गुणाढ्यः ४८. गोचरः ४९. अविद्यामूलनाशः ५०. विद्याऽविद्यास्वरूपी
५१. आयुष्यकारणः ५२. आपदुद्धर्ता ५३. विष्णुभक्तः ५४. वशी ५५. विविधागमवेदी ५६. विधिस्तुत्यः ५७. वन्द्यः ५८. विरूपाक्षः ५९. वरिष्ठः ६०. गरिष्ठः
६१. वज्राङ्कुशधरः ६२. वरदाऽभयहस्तः ६३. वामनः ६४. ज्येष्ठापत्नीसमेतः ६५. श्रेष्ठः ६६. मितभाषी ६७. कष्टौघनाशकर्यः ६८. पुष्टिदः ६९. स्तुत्यः ७०. स्तोत्रगम्यः
७१. भक्तिवश्यः ७२. भानुः ७३. भानुपुत्रः ७४. भव्यः ७५. पावनः ७६. धनुर्मण्डलसंस्थः ७७. धनदः ७८. धनुष्मान् ७९. तनुप्रकाशदेहः ८०. तामसः
८१. अशेषजनवन्द्यः ८२. विशेषफलदायी ८३. वशीकृतजनेशः ८४. पशूनां पतिः ८५. खेचरः ८६. खगेशः ८७. घननीलाम्बरः ८८. काठिन्यमानसः ८९. आर्यगणस्तुत्यः ९०. नीलच्छत्रः
९१. नित्यः ९२. निर्गुणः ९३. गुणात्मा ९४. निरामयः ९५. निन्द्यः ९६. वन्दनीयः ९७. धीरः ९८. दिव्यदेहः ९९. दीनार्तिहरणः १००. दैन्यनाशकरः
१०१. आर्यजनगण्यः १०२. क्रूरः १०३. क्रूरचेष्टः १०४. कामक्रोधकरः १०५. कलत्रपुत्रशत्रुत्वकारणः १०६. परिपोषितभक्तः १०७. परभीतिहरः १०८. भक्तसङ्घमनोऽभीष्टफलदः`,
    transliteration: `1. Shanaishcharah 2. Shantah 3. Sarvabhishtapradayi 4. Sharanyah 5. Varenyah 6. Sarveshah 7. Saumyah 8. Suravandyah 9. Suralokavihari 10. Sukhasanopavishtah
11. Sundarah 12. Ghanah 13. Ghanarupah 14. Ghanabharanadhari 15. Ghanasaravilepah 16. Khadyotah 17. Mandah 18. Mandacheshtah 19. Mahaniyagunatma 20. Martyapavanapadah
21. Maheshah 22. Chhayaputrah 23. Sharvah 24. Sharatunidhari 25. Charasthirasvabhavah 26. Chanchalah 27. Nilavarnah 28. Nityah 29. Nilanjananibhah 30. Nilambaravibhushah
31. Nishchalah 32. Vedyah 33. Vidhirupah 34. Virodhadharabhumih 35. Bhedaspadasvabhavah 36. Vajradehah 37. Vairagyadah 38. Virah 39. Vitarogabhayah 40. Vipatparampareshah
41. Vishwavandyah 42. Gridhnavahah 43. Gudhah 44. Kurmangah 45. Kurupi 46. Kutsitah 47. Gunadhyah 48. Gocharah 49. Avidyamulanashah 50. Vidyavidyasvarupi
51. Ayushyakaranah 52. Apaduddharta 53. Vishnubhaktah 54. Vashi 55. Vividhagamavedi 56. Vidhistutyah 57. Vandyah 58. Virupakshah 59. Varishthah 60. Garishthah
61. Vajrankushadharah 62. Varadabhayahastah 63. Vamanah 64. Jyeshthapatnisametah 65. Shreshthah 66. Mitabhashi 67. Kashtaughanashakaryah 68. Pushtidah 69. Stutyah 70. Stotragamyah
71. Bhaktivashyah 72. Bhanuh 73. Bhanuputrah 74. Bhavyah 75. Pavanah 76. Dhanurmandalasansthah 77. Dhanadah 78. Dhanushman 79. Tanuprakashadehah 80. Tamasah
81. Asheshajanavandyah 82. Visheshaphaladayi 83. Vashikritajaneshah 84. Pashunam Patih 85. Khecharah 86. Khageshah 87. Ghananilambarah 88. Kathinyamanasah 89. Aryaganastutyah 90. Nilachchhatrah
91. Nityah 92. Nirgunah 93. Gunatma 94. Niramayah 95. Nindyah 96. Vandaniyah 97. Dhirah 98. Divyadehah 99. Dinartiharanah 100. Dainyanashakarah
101. Aryajanaganyah 102. Krurah 103. Kruracheshtah 104. Kamakrodhakarah 105. Kalatraputrashatrutvakaranah 106. Pariposhitabhaktah 107. Parabhitiharah 108. Bhaktasanghamano'bhishtaphaladah.`,
    meaning: 'This is a list of 108 names of Shani (Saturn), describing him as the impartial judge of karma (Nyayadhish), son of Surya, associated with discipline, delay, and justice, and as the one who tests and ultimately rewards perseverance.', meaningHi: 'यह शनि (शनि ग्रह) के 108 नामों की सूची है, जो उन्हें कर्म के निष्पक्ष न्यायाधीश (न्यायाधीश), सूर्यपुत्र, अनुशासन, विलंब और न्याय से जुड़े, तथा दृढ़ता की परीक्षा लेकर अंततः पुरस्कृत करने वाले के रूप में वर्णित करती है।',
    benefits: 'Recited or used for Archana with black sesame or blue flowers on Saturdays, during Shani Jayanti and Sadhesati, invoking relief from hardship and karmic justice.', benefitsHi: 'शनिवार, शनि जयंती और साढ़े साती के दौरान काले तिल या नीले फूलों से अर्चना के लिए पाठ या उपयोग किया जाता है, जो कठिनाई से राहत और कर्मिक न्याय का आह्वान करता है।',
  },
];
