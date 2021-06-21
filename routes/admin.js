const { resolveSoa } = require('dns')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

//Models
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

//Helper
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina posts")
})


//Categorias
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', "Houve erro ao listar as categorias")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito pequeno" })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria Criada com Sucesso!")
            console.log('insert success')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Error")
            console.log("Erro: " + err)
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Categoria invalida")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito pequeno" })
    }

    if (erros.length > 0) {
        res.render('admin/editcategorias', { erros: erros })
    } else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                console.log('edit success')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar")
                console.log("Erro: " + err)
                res.redirect('/admin/categorias')
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar")
            console.log("Erro: " + err)
            res.redirect('/admin/categorias')

        })
    }
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        console.log('delete success')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        console.log("Erro: " + err)
        res.redirect('/admin/categorias')
    })

})


//Postagens
router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens")
        console.log("Erro: " + err)
        res.redirect('/admin/postagens')
    })

})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar formulario")
        console.log("Erro: " + err)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || typeof req.body.titulo == null) {
        erros.push({ texto: "titulo invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({ texto: "slug invalido" })
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || typeof req.body.descricao == null) {
        erros.push({ texto: "descricao invalido" })
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || typeof req.body.conteudo == null) {
        erros.push({ texto: "conteudo invalido" })
    }

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida" })
    }

    if (erros.length > 0) {
        res.render('admin/addpostagens', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada com Sucesso!")
            console.log('insert success')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash("error_msg", "Error")
            console.log("Erro: " + err)
            res.redirect('/admin/postagens')
        })
    }
})


router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', { postagem: postagem, categorias: categorias })
        }).catch((err) => {
            req.flash("error_msg", "Erro categoria")
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || typeof req.body.titulo == null) {
        erros.push({ texto: "titulo invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({ texto: "slug invalido" })
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || typeof req.body.descricao == null) {
        erros.push({ texto: "descricao invalido" })
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || typeof req.body.conteudo == null) {
        erros.push({ texto: "conteudo invalido" })
    }

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida" })
    }

    if (erros.length > 0) {
        res.render('admin/editpostagens', { erros: erros })
    } else {
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {

            postagem.titulo = req.body.titulo,
                postagem.slug = req.body.slug,
                postagem.descricao = req.body.descricao,
                postagem.conteudo = req.body.conteudo,
                postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                console.log('edit success')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar")
                console.log("Erro: " + err)
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar")
            console.log("Erro: " + err)
            res.redirect('/admin/postagens')

        })
    }
})

router.post("/postagens/deletar", eAdmin, (req, res) => {
    Postagem.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        console.log('delete success')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        console.log("Erro: " + err)
        res.redirect('/admin/postagens')
    })
})

module.exports = router