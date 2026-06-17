"""
rag.py - Palmistry knowledge base retrieval (ChromaDB + sentence-transformers)
"""

import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path

KB_DIR = Path(__file__).parent / "knowledge_base"
DB_DIR = Path(__file__).parent / "chroma_db"

_COLLECTION_NAME = "palmistry_kb"
_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection

    DB_DIR.mkdir(exist_ok=True)
    _client = chromadb.PersistentClient(path=str(DB_DIR))

    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    _collection = _client.get_or_create_collection(
        name=_COLLECTION_NAME,
        embedding_function=emb_fn,
        metadata={"hnsw:space": "cosine"},
    )

    if _collection.count() == 0:
        _build_index(_collection)

    return _collection


def _build_index(collection):
    """Chunk and index all .txt files in knowledge_base/"""
    docs, ids = [], []
    for txt_path in sorted(KB_DIR.glob("*.txt")):
        text = txt_path.read_text(encoding="utf-8")
        chunks = _chunk_text(text, chunk_size=400, overlap=80)
        for i, chunk in enumerate(chunks):
            docs.append(chunk)
            ids.append(f"{txt_path.stem}_{i}")

    if docs:
        collection.add(documents=docs, ids=ids)
        print(f"[RAG] Đã index {len(docs)} đoạn từ knowledge base.")


def _chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, buf = [], ""
    for para in paragraphs:
        if len(buf) + len(para) > chunk_size and buf:
            chunks.append(buf.strip())
            # keep overlap
            buf = buf[-overlap:] + "\n\n" + para
        else:
            buf = (buf + "\n\n" + para).strip()
    if buf:
        chunks.append(buf.strip())
    return chunks


def retrieve(query: str, n_results: int = 5) -> str:
    """Return relevant palmistry context for a query."""
    collection = _get_collection()
    results = collection.query(query_texts=[query], n_results=n_results)
    docs = results.get("documents", [[]])[0]
    if not docs:
        return ""
    return "\n\n---\n\n".join(docs)


def rebuild_index():
    """Force re-index (call after updating knowledge_base/)."""
    global _client, _collection
    if _client is not None:
        try:
            _client.delete_collection(_COLLECTION_NAME)
        except Exception:
            pass
    _collection = None
    _get_collection()
    print("[RAG] Index đã được xây dựng lại.")
