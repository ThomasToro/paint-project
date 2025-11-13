package paintproject.paintapp.model;

public class Drawing {
    private Long id;
    private String title;
    private String vectorData;
    private String backgroundImagePath;
    private Long userId;

    public Drawing() {
    }

    public Drawing(Long id, String title, String vectorData, String backgroundImagePath, Long userId) {
        this.id = id;
        this.title = title;
        this.vectorData = vectorData;
        this.backgroundImagePath = backgroundImagePath;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVectorData() {
        return vectorData;
    }

    public void setVectorData(String vectorData) {
        this.vectorData = vectorData;
    }

    public String getBackgroundImagePath() {
        return backgroundImagePath;
    }

    public void setBackgroundImagePath(String backgroundImagePath) {
        this.backgroundImagePath = backgroundImagePath;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "Drawing{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", userId=" + userId +
                '}';
    }
}
