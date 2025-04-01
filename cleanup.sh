#!/bin/bash

# Tuer tous les processus node
pkill -9 -f node

# Afficher les processus restants
echo "Processus après nettoyage:"
ps aux | grep -i node | grep -v grep

echo "Nettoyage terminé!" 