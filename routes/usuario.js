const { resolveSoa } = require('dns')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.get("/registro", (req, res) => {
    res.render("usuarios/registro")

})

router.post("/registro", (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.email || typeof req.body.email == undefined || typeof req.body.email == null) {
        erros.push({ texto: "Email invalido" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || typeof req.body.senha == null) {
        erros.push({ texto: "Senha invalido" })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "Senhas divergentes" })
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros })
    } else {

        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe um usuario com esse e-mail')
                res.redirect('/usuarios/registro')
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', "Houve erro ao salvar usuario")
                            res.redirect('/')
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuario Criado com Sucesso!')
                            console.log('insert success')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Error')
                            console.log('Erro: ' + err)
                            res.redirect('/usuarios/registro')
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro')
            res.redirect('/')
        })


    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect('/')
})

module.exports = router