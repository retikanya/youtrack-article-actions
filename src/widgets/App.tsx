import { useEffect, useState } from "react";
import { Article, Project } from "./types.ts";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { useTranslation } from "react-i18next";
import { copyArticle, loadArticle, loadProjects, moveArticle } from "./api.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { Input, Size } from "@jetbrains/ring-ui-built/components/input/input";
import ButtonSet from "@jetbrains/ring-ui-built/components/button-set/button-set";
import { host } from "./youTrackApp.ts";

//todo: permissions
//todo: hide widget in draft menu
//todo: copy attachments
//todo: copy child articles
//todo: change parent article
export default function App() {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [article, setArticle] = useState<Article>();
    const [projects, setProjects] = useState<Project[]>();

    useEffect(() => {
        loadArticle().then((res: Article) => {
            setArticle(res);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center">
            <Loader message={t("loading")}/>
        </div>
    );

    //todo: error
    if (!article) return <></>;

    return (
        <form className="w-full flex flex-col ring-form">
            <div className="ring-form__group">
                <label htmlFor="titleInput" className="ring-form__label">{t("titleInputLabel")}</label>
                <div className="ring-form__control">
                    <Input
                        id="titleInput"
                        defaultValue={article.summary ?? ""}
                        size={Size.FULL}
                        onChange={(event) => {
                            setArticle((article) =>
                                article && {
                                    ...article,
                                    summary: event.currentTarget.value
                                });
                        }}
                    />
                </div>
            </div>
            <div className="ring-form__group">
                <label htmlFor="projectSelection" className="ring-form__label">{t("projectSelectionLabel")}</label>
                <div className="ring-form__control">
                    <Select
                        id="projectSelection"
                        filter={{ placeholder: t("filterItems") }}
                        loading={projects == undefined}
                        loadingMessage={t("loading")}
                        notFoundMessage={t("noOptionsFound")}
                        onOpen={() => loadProjects().then(setProjects)}
                        data={projects?.map(toSelectItem)}
                        onSelect={(item) => {
                            if (!item) return;
                            setArticle({
                                ...article,
                                project: item.model
                            });
                        }}
                        // selected={toSelectItem(article.project)} Doesn't work as default
                        size={Size.FULL}
                    />
                </div>
            </div>
            <ButtonSet className="ring-form__group">
                <Button primary disabled={!article.project} onClick={() => {
                    console.log(article);
                    copyArticle(article).then(() => {
                        host.alert("Please close the modal and reload!")
                    })
                }}>
                    {t("copyButtonLabel")}
                </Button>
                <Button disabled={!article.project} onClick={() => {
                    console.log(article);
                    moveArticle(article.idReadable, article.project!).then(() => {
                        host.alert("Please close the modal and reload!")
                    })
                }}>
                    {t("moveButtonLabel")}
                </Button>
            </ButtonSet>
        </form>
    );
}

const toSelectItem = (it: Project) => ({ key: it.id, label: it.name, model: it });


