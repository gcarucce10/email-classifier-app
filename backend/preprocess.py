import nltk, spacy
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer

# Faz o download dos recursos necessários do NLTK: tokenizador e stopwords
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('rslp')

# Cria um conjunto de stopwords em português
stop_words = set(stopwords.words('portuguese'))
# Inicializa o stemmer para português
stemmer = RSLPStemmer()
# Carrega o modelo de linguagem spaCy para português
nlp_spacy = spacy.load("pt_core_news_md")

def preprocess_pt(text):
    # Tokenização
    tokens = nltk.word_tokenize(text.lower(), language='portuguese')
    tokens = [t for t in tokens if t.isalpha() and t not in stop_words]
    # Stemming com NLTK
    stems = [stemmer.stem(t) for t in tokens]
    # Lematização com spaCy
    doc = nlp_spacy(" ".join(tokens))
    lemmas = [token.lemma_ for token in doc]
    return " ".join(lemmas)
