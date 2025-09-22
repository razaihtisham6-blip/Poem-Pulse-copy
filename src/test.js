export function analyzeFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return fetch("http://127.0.0.1:8000/analyse", {
        method: "POST",
        body: formData,
    }).then((res) => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
    });
}